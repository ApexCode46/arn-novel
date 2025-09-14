import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Payment session:', JSON.stringify(session, null, 2));
    console.log('Payment session user:', session?.user);
    console.log('Payment session user id:', session?.user?.id);
    console.log('Payment session user sub:', session?.user?.sub);

    if (!session?.user?.id && !session?.user?.sub) {
      console.log('No user ID found in payment session');
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อน" },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.sub;

    const { packageId, amount, price } = await request.json();

    if (!packageId || !amount || !price) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // ค้นหาแพ็คเกจใน database
    const coinPackage = await prisma.coinPackage.findUnique({
      where: { package_id: packageId }
    });

    if (!coinPackage) {
      return NextResponse.json(
        { error: "ไม่พบแพ็คเกจที่เลือก" },
        { status: 404 }
      );
    }

    // ค้นหา wallet ของผู้ใช้
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "ไม่พบกระเป๋าเงินของผู้ใช้" },
        { status: 404 }
      );
    }

    // สร้าง transaction record
    const transaction = await prisma.transaction.create({
      data: {
        wallet_id: wallet.wallet_id,
        amount: amount,
        type: "TOPUP",
        coin_package_id: packageId,
        payment_method: "stripe",
        payment_status: "PENDING",
        currency: "THB"
      }
    });

    // สร้าง Checkout Session แทน Payment Intent
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['promptpay'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: `${coinPackage.name}`,
              description: `${amount} coins (${coinPackage.amount} + ${coinPackage.bonus} bonus)`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/wallet/success?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/wallet/success?payment=cancelled`,
      metadata: {
        transaction_id: transaction.transaction_id,
        user_id: userId,
        package_id: packageId,
        coin_amount: amount.toString()
      },
    });

    // อัพเดท transaction ด้วย checkout session id
    await prisma.transaction.update({
      where: { transaction_id: transaction.transaction_id },
      data: {
        stripe_payment_intent_id: checkoutSession.id // ใช้ session id แทน
      }
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      transactionId: transaction.transaction_id
    });

  } catch (error) {
    console.error("Payment Intent Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างการชำระเงิน" },
      { status: 500 }
    );
  }
}
