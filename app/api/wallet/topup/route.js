import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Topup session:', JSON.stringify(session, null, 2));
    console.log('Topup session user:', session?.user);
    console.log('Topup session user id:', session?.user?.id);
    console.log('Topup session user sub:', session?.user?.sub);

    if (!session?.user?.id && !session?.user?.sub) {
      console.log('No user ID found in topup session');
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 });
    }

    const userId = session.user.id || session.user.sub;

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "จำนวนเงินไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // ตรวจสอบหรือสร้าง wallet
    let wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          user_id: userId,
          balance: 0,
        },
      });
    }

    // เติมเงินและสร้างธุรกรรม
    const updatedWallet = await prisma.wallet.update({
      where: { user_id: userId },
      data: {
        balance: {
          increment: amount,
        },
        transaction: {
          create: {
            amount: amount,
            type: "TOPUP",
          },
        },
      },
      include: {
        transaction: {
          orderBy: { created_at: "desc" },
          take: 20,
        },
      },
    });

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error("Error topping up wallet:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเติมเงิน" },
      { status: 500 }
    );
  }
}
