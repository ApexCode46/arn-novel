import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// Import authOptions from NextAuth config
const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน", success: false },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "ไม่พบ session ID", success: false },
        { status: 400 }
      );
    }

    // ดึงข้อมูล checkout session จาก Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลการชำระเงิน", success: false },
        { status: 404 }
      );
    }

    // ตรวจสอบสถานะการชำระเงิน
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        { 
          error: "การชำระเงินยังไม่สำเร็จ", 
          success: false,
          status: checkoutSession.payment_status 
        },
        { status: 400 }
      );
    }

    // ดึงข้อมูลจาก metadata
    const { transaction_id, user_id, coin_amount } = checkoutSession.metadata;

    // ตรวจสอบว่าเป็นผู้ใช้เดียวกัน
    if (user_id !== session.user.id) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้", success: false },
        { status: 403 }
      );
    }

    // ตรวจสอบว่า transaction ได้ถูกประมวลผลแล้วหรือไม่
    const transaction = await prisma.transaction.findUnique({
      where: { transaction_id: transaction_id }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลธุรกรรม", success: false },
        { status: 404 }
      );
    }

    if (transaction.payment_status === 'SUCCESS') {
      // ธุรกรรมได้ถูกประมวลผลแล้ว
      return NextResponse.json({
        success: true,
        message: "การชำระเงินสำเร็จแล้ว",
        coinAmount: parseInt(coin_amount),
        alreadyProcessed: true
      });
    }

    // ประมวลผลการชำระเงิน (เผื่อ webhook ยังไม่ทำงาน)
    await prisma.$transaction(async (tx) => {
      // อัปเดต transaction status
      await tx.transaction.update({
        where: { transaction_id: transaction_id },
        data: {
          payment_status: "SUCCESS",
          stripe_payment_intent_id: sessionId
        }
      });

      // หา wallet ของผู้ใช้
      let wallet = await tx.wallet.findUnique({
        where: { user_id: user_id }
      });

      // สร้าง wallet ถ้าไม่มี
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            user_id: user_id,
            balance: 0,
          }
        });
      }

      // อัปเดต wallet balance
      await tx.wallet.update({
        where: { user_id: user_id },
        data: {
          balance: {
            increment: parseInt(coin_amount)
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "การชำระเงินสำเร็จ! Coins ได้ถูกเพิ่มเข้ากระเป๋าแล้ว",
      coinAmount: parseInt(coin_amount),
      transactionId: transaction_id
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน", 
        success: false 
      },
      { status: 500 }
    );
  }
}
