import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// API สำหรับดูสถานะของตอนที่กำลัง scheduled ทั้งหมด
export async function GET() {
  try {
    const now = new Date();

    // หาตอนที่มีสถานะ scheduled ทั้งหมด
    const scheduledChapters = await prisma.chapters.findMany({
      where: {
        status: "scheduled",
      },
      select: {
        chapter_id: true,
        title: true,
        order: true,
        story_id: true,
        scheduled_date: true,
        created_at: true,
        updated_at: true,
        stories: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        scheduled_date: "asc",
      },
    });

    // แบ่งเป็นกลุ่ม: ถึงเวลาแล้ว vs ยังไม่ถึงเวลา
    const readyToPublish = scheduledChapters.filter(
      (chapter) =>
        chapter.scheduled_date && new Date(chapter.scheduled_date) <= now
    );

    const waitingToPublish = scheduledChapters.filter(
      (chapter) =>
        chapter.scheduled_date && new Date(chapter.scheduled_date) > now
    );

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary: {
        total_scheduled: scheduledChapters.length,
        ready_to_publish: readyToPublish.length,
        waiting_to_publish: waitingToPublish.length,
      },
      ready_to_publish: readyToPublish.map((chapter) => ({
        chapter_id: chapter.chapter_id,
        title: chapter.title,
        order: chapter.order,
        story_title: chapter.stories?.title,
        author: chapter.stories?.author,
        scheduled_date: chapter.scheduled_date,
        time_overdue: chapter.scheduled_date
          ? Math.floor((now - new Date(chapter.scheduled_date)) / (1000 * 60)) +
            " minutes"
          : "unknown",
      })),
      waiting_to_publish: waitingToPublish.map((chapter) => ({
        chapter_id: chapter.chapter_id,
        title: chapter.title,
        order: chapter.order,
        story_title: chapter.stories?.title,
        author: chapter.stories?.author,
        scheduled_date: chapter.scheduled_date,
        time_remaining: chapter.scheduled_date
          ? Math.floor((new Date(chapter.scheduled_date) - now) / (1000 * 60)) +
            " minutes"
          : "unknown",
      })),
    });
  } catch (error) {
    console.error("Error fetching scheduled chapters status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
