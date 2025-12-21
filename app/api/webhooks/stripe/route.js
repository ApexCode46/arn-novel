import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        await handleFailedPayment(failedPayment);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

async function handleSuccessfulPayment(paymentObject) {
  // Handle both checkout sessions and payment intents
  const metadata = paymentObject.metadata;
  const stripeId = paymentObject.id;

  if (!metadata) {
    console.error("No metadata found in payment object");
    return;
  }

  const { user_id, coin_amount, transaction_id } = metadata;
  const totalCoins = parseInt(coin_amount);

  try {
    await prisma.$transaction(async (tx) => {
      // อัปเดต transaction status
      if (transaction_id) {
        await tx.transaction.update({
          where: { transaction_id: transaction_id },
          data: {
            payment_status: "SUCCESS",
            stripe_payment_intent_id: stripeId,
          },
        });
      }

      // หา wallet ของผู้ใช้
      let wallet = await tx.wallet.findUnique({
        where: { user_id: user_id },
      });

      // สร้าง wallet ถ้าไม่มี
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            user_id: user_id,
            balance: 0,
          },
        });
      }

      // อัปเดต wallet balance
      await tx.wallet.update({
        where: { user_id: user_id },
        data: {
          balance: {
            increment: totalCoins,
          },
        },
      });

      // สร้างธุรกรรม
      await tx.transaction.create({
        data: {
          wallet_id: wallet.wallet_id,
          amount: totalCoins,
          type: "TOPUP",
          stripe_payment_intent_id: paymentIntent.id,
          payment_method: "stripe",
          payment_status: "SUCCESS",
          currency: "THB",
          notes: `ซื้อแพ็คเกจ ${packageId}`,
        },
      });
    });

    console.log(`Successfully added ${totalCoins} coins to user ${userId}`);
  } catch (error) {
    console.error("Error updating wallet:", error);
  }
}

async function handleFailedPayment(paymentIntent) {
  const { userId, packageId } = paymentIntent.metadata;

  try {
    // บันทึกธุรกรรมที่ล้มเหลว
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });

    if (wallet) {
      await prisma.transaction.create({
        data: {
          wallet_id: wallet.wallet_id,
          amount: 0,
          type: "TOPUP",
          stripe_payment_intent_id: paymentIntent.id,
          payment_method: "stripe",
          payment_status: "FAILED",
          currency: "THB",
          notes: `การซื้อแพ็คเกจ ${packageId} ล้มเหลว`,
        },
      });
    }

    console.log(`Payment failed for user ${userId}, package ${packageId}`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
