import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // ดึงข้อมูล coin packages ทั้งหมดที่ active และเรียงตาม price จากน้อยไปมาก
    const coinPackages = await prisma.coinPackage.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        price: "asc", // เรียงจากน้อยไปมาก
      },
      select: {
        package_id: true,
        name: true,
        amount: true,
        bonus: true,
        price: true,
        original_price: true,
        is_popular: true,
        description: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: coinPackages,
    });
  } catch (error) {
    console.error("Error fetching coin packages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ไม่สามารถดึงข้อมูลแพ็คเกจได้",
      },
      { status: 500 }
    );
  }
}
