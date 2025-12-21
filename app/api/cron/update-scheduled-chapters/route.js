import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API สำหรับอัปเดตตอนที่มีสถานะ scheduled ให้เป็น published เมื่อถึงเวลา
export async function GET() {
  try {
    const now = new Date();
    
    console.log(`[${now.toISOString()}] Starting auto-publish scheduled chapters check...`);

    // หาตอนที่มีสถานะ scheduled และเวลาถึงแล้ว
    const chaptersToPublish = await prisma.chapters.findMany({
      where: {
        status: "scheduled",
        scheduled_date: {
          lte: now // น้อยกว่าหรือเท่ากับเวลาปัจจุบัน
        }
      },
      select: {
        chapter_id: true,
        title: true,
        order: true,
        story_id: true,
        scheduled_date: true
      }
    });

    if (chaptersToPublish.length === 0) {
      console.log("No chapters to publish at this time");
      return NextResponse.json({ 
        message: "No chapters to publish", 
        count: 0,
        timestamp: now.toISOString()
      });
    }

    console.log(`Found ${chaptersToPublish.length} chapters ready to publish:`, 
      chaptersToPublish.map(ch => ({
        chapter_id: ch.chapter_id,
        title: ch.title,
        scheduled_date: ch.scheduled_date
      }))
    );

    // อัปเดตสถานะเป็น published
    const updateResult = await prisma.chapters.updateMany({
      where: {
        status: "scheduled",
        scheduled_date: {
          lte: now
        }
      },
      data: {
        status: "published",
        scheduled_date: null, // ลบวันที่ที่กำหนดออก
        updated_at: now
      }
    });

    console.log(`Successfully published ${updateResult.count} chapters automatically`);

    // Log แต่ละตอนที่ถูกเผยแพร่
    for (const chapter of chaptersToPublish) {
      console.log(`Published: "${chapter.title}" (Order: ${chapter.order}) - Was scheduled for: ${chapter.scheduled_date}`);
    }

    return NextResponse.json({
      success: true,
      message: "Chapters published successfully",
      count: updateResult.count,
      timestamp: now.toISOString(),
      publishedChapters: chaptersToPublish.map(ch => ({
        chapter_id: ch.chapter_id,
        title: ch.title,
        order: ch.order,
        story_id: ch.story_id,
        was_scheduled_for: ch.scheduled_date
      }))
    });

  } catch (error) {
    console.error("Error in auto-publish cron job:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST method สำหรับการเรียกใช้ manual
export async function POST() {
  console.log("Manual trigger for auto-publish scheduled chapters");
  return GET();
}
