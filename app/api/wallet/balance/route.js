import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("user_id");

    if (!queryUserId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า prisma client พร้อมใช้งานหรือไม่
    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    const userIdentifier = queryUserId.trim();
    let userId = null;

    // ตรวจสอบว่า queryUserId เป็น email หรือ user ID
    if (userIdentifier.includes("@")) {
      // ถ้าเป็น email ให้ค้นหา user ก่อน
      const user = await prisma.user.findUnique({
        where: { email: userIdentifier },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json({ balance: 0 });
      }

      userId = user.id;
    } else {
      // ถ้าเป็น user ID ให้ใช้ตรงๆ
      userId = userIdentifier;
    }

    // Fetch user's wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
      select: { balance: true },
    });

    if (!wallet) {
      return NextResponse.json({ balance: 0 });
    }

    return NextResponse.json({ balance: wallet.balance });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
