import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { storyId, chapterId, price = "chapter", userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!chapterId || !price || price <= 0) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check user's current balance
      const wallet = await tx.wallet.findUnique({
        where: { user_id: userId },
        select: { wallet_id: true, balance: true },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.balance < price) {
        throw new Error("Insufficient balance");
      }

      // Check if user already purchased this chapter by looking at transactions
      const existingPurchase = await tx.transaction.findFirst({
        where: {
          wallet_id: wallet.wallet_id,
          chapter_id: chapterId,
          type: "PURCHASE",
          payment_status: "SUCCESS",
        },
      });

      if (existingPurchase) {
        throw new Error("Chapter already purchased");
      }

      // Deduct coins from wallet
      const updatedWallet = await tx.wallet.update({
        where: { user_id: userId },
        data: {
          balance: {
            decrement: price,
          },
        },
      });

      // Create transaction record for the purchase
      const transaction = await tx.transaction.create({
        data: {
          wallet_id: wallet.wallet_id,
          amount: price, // positive amount for purchase
          type: "PURCHASE",
          story_id: storyId,
          chapter_id: chapterId,
          payment_method: "coins",
          payment_status: "SUCCESS",
          currency: "THB",
          notes: `Purchase chapter: ${chapterId}`,
        },
      });

      return {
        transaction,
        newBalance: updatedWallet.balance,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        transactionId: result.transaction.transaction_id,
        newBalance: result.newBalance,
        message: "Chapter purchased successfully",
      },
    });
  } catch (error) {
    console.error("Purchase error:", error);

    if (error.message === "Insufficient balance") {
      return NextResponse.json({ error: "เหรียญไม่เพียงพอ" }, { status: 400 });
    }

    if (error.message === "Chapter already purchased") {
      return NextResponse.json(
        { error: "คุณได้ซื้อตอนนี้แล้ว" },
        { status: 400 }
      );
    }

    if (error.message === "Wallet not found") {
      return NextResponse.json(
        { error: "ไม่พบกระเป๋าเงินของผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการซื้อ",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
