import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API สำหรับอัปเดตการตั้งค่าตอน (settings only)
export async function PATCH(req, { params }) {
  try {
    const { storyId, chapter } = await params;
    const chapterOrder = parseInt(chapter);
    const body = await req.json();
    const { status, scheduledDate, isHidden, price } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId is required" },
        { status: 400 }
      );
    }

    if (isNaN(chapterOrder)) {
      return NextResponse.json(
        { error: "chapter order must be a valid number" },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !["draft", "published", "scheduled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be draft, published, or scheduled" },
        { status: 400 }
      );
    }

    // Validate scheduledDate if status is scheduled
    if (status === "scheduled" && !scheduledDate) {
      return NextResponse.json(
        { error: "scheduledDate is required when status is scheduled" },
        { status: 400 }
      );
    }

    // Validate isHidden type
    if (isHidden !== undefined && typeof isHidden !== "boolean") {
      return NextResponse.json(
        { error: "isHidden must be a boolean value" },
        { status: 400 }
      );
    }

    // เช็คและอัปเดตตอนที่ถึงเวลาเผยแพร่แล้วก่อน
    await checkAndUpdateScheduledChapters();

    // ตรวจสอบว่า story มีอยู่จริง
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId,
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // ตรวจสอบว่า chapter มีอยู่จริง
    const existingChapter = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
      },
      select: {
        chapter_id: true,
        status: true,
        admin_hidden: true,
        admin_hide_reason: true
      }
    });

    if (!existingChapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // ตรวจสอบว่าถูก admin ซ่อนไว้หรือไม่
    if (existingChapter.admin_hidden) {
      return NextResponse.json(
        { 
          error: "ไม่สามารถแก้ไขการตั้งค่าตอนนี้ได้ เนื่องจากถูกระงับโดยผู้ดูแลระบบ",
          reason: existingChapter.admin_hide_reason 
        },
        { status: 403 }
      );
    }

    // ตรวจสอบว่าไม่สามารถเปลี่ยนจาก published กลับเป็น draft หรือ scheduled ได้
    if (
      existingChapter.status === "published" &&
      status &&
      status !== "published"
    ) {
      return NextResponse.json(
        {
          error:
            "ไม่สามารถเปลี่ยนสถานะจากเผยแพร่แล้วกลับเป็นร่างหรือรอการเผยแพร่ได้",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าตอนก่อนหน้าต้องเผยแพร่แล้วก่อนถึงจะเผยแพร่ตอนนี้ได้
    if (status === "published" && chapterOrder > 1) {
      const previousChapter = await prisma.chapters.findFirst({
        where: {
          story_id: storyId,
          order: chapterOrder - 1,
        },
      });

      if (previousChapter && previousChapter.status !== "published") {
        return NextResponse.json(
          {
            error: `ไม่สามารถเผยแพร่ตอนที่ ${chapterOrder} ได้ เนื่องจากตอนที่ ${chapterOrder - 1} ยังไม่ได้เผยแพร่`,
          },
          { status: 400 }
        );
      }
    }

    // เตรียม data สำหรับอัปเดต
    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;

      // ถ้า status เป็น scheduled และมี scheduledDate
      if (status === "scheduled" && scheduledDate) {
        updateData.scheduled_date = new Date(scheduledDate);
      } else if (status !== "scheduled") {
        // ถ้า status ไม่ใช่ scheduled ให้ลบ scheduled_date
        updateData.scheduled_date = null;
      }
    }

    if (isHidden !== undefined) {
      updateData.is_hidden = isHidden;
    }

    if (price !== undefined) {
      updateData.price = price;
    }

    // Debug: แสดงข้อมูลที่ได้รับและจะอัปเดต
    console.log("Received data:", { status, scheduledDate, isHidden, price });
    console.log("Update data:", updateData);

    // ถ้าไม่มีข้อมูลที่ต้องอัปเดต
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No data provided for update" },
        { status: 400 }
      );
    }

    // อัปเดต chapter settings
    const updatedChapter = await prisma.chapters.update({
      where: {
        chapter_id: existingChapter.chapter_id,
      },
      data: updateData,
      select: {
        chapter_id: true,
        order: true,
        title: true,
        status: true,
        scheduled_date: true,
        is_hidden: true,
        price: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json(
      {
        message: "Chapter settings updated successfully",
        chapter: updatedChapter,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating chapter settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// API สำหรับดึงการตั้งค่าตอน (settings only)
export async function GET(req, { params }) {
  try {
    const { storyId, chapter } = await params;
    const chapterOrder = parseInt(chapter);

    if (!storyId) {
      return NextResponse.json(
        { error: "storyId is required" },
        { status: 400 }
      );
    }

    if (isNaN(chapterOrder)) {
      return NextResponse.json(
        { error: "chapter order must be a valid number" },
        { status: 400 }
      );
    }

    // เช็คและอัปเดตตอนที่ถึงเวลาเผยแพร่แล้วก่อน
    await checkAndUpdateScheduledChapters();

    // ตรวจสอบว่า story มีอยู่จริง
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId,
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // ดึงข้อมูลการตั้งค่าตอน
    const chapterSettings = await prisma.chapters.findFirst({
      where: {
        story_id: storyId,
        order: chapterOrder,
      },
      select: {
        chapter_id: true,
        order: true,
        title: true,
        status: true,
        scheduled_date: true,
        is_hidden: true,
        price: true,
        updated_at: true,
      },
    });

    if (!chapterSettings) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Chapter settings retrieved successfully",
      settings: chapterSettings,
    });
  } catch (error) {
    console.error("Error fetching chapter settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ฟังก์ชันสำหรับเช็คและอัปเดตตอนที่ถึงเวลาเผยแพร่แล้ว
async function checkAndUpdateScheduledChapters() {
  try {
    const now = new Date();

    const updateResult = await prisma.chapters.updateMany({
      where: {
        status: "scheduled",
        scheduled_date: {
          lte: now,
        },
      },
      data: {
        status: "published",
        scheduled_date: null,
        updated_at: now,
      },
    });

    if (updateResult.count > 0) {
      console.log(
        `Auto-published ${updateResult.count} chapters that reached their scheduled time`
      );
    }

    return updateResult.count;
  } catch (error) {
    console.error("Error in checkAndUpdateScheduledChapters:", error);
    return 0;
  }
}
