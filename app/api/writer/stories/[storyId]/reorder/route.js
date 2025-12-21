import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ตรวจสอบว่าไฟล์นี้ export prisma client แล้ว

// PUT /api/writer/stories/:storyId/reorder
export async function PUT(req, { params }) {
  const body = await req.json();
  const { chapters } = body; // [{ chapter_id, order }, ...]

  if (!Array.isArray(chapters) || chapters.length === 0) {
    return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  try {
    // ใช้ Prisma transaction เพื่ออัปเดตพร้อมกัน
    await prisma.$transaction(
      chapters.map((ch) =>
        prisma.chapters.update({
          where: { chapter_id: ch.chapter_id },
          data: {
            order: ch.order,
            updated_at: new Date(),
          },
        })
      )
    );

    return NextResponse.json({ message: "✅ อัปเดตลำดับตอนเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error updating chapter order:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการอัปเดตลำดับตอน" },
      { status: 500 }
    );
  }
}
