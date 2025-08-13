import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfWeek, endOfWeek } from "date-fns";

export async function GET(req, { params }) {
  try {
    const { category } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const offset = (page - 1) * limit;
    const userId = req.headers.get("X-User-Id");

    let whereCondition;

    if (category === "following" && userId) {
      whereCondition = {
        follow: {
          some: {
            user_id: userId,
          },
        },
      };
    } else {
      whereCondition = {
        category:
          category === "new" || category === "weekly" ? undefined : { contains: category },
        status: "published",
        ...(category === "new" && {
          created_at: {
            gte: subDays(new Date(), 30),
          },
        }),
        ...(category === "weekly" && {
          chapter: {
            some: {
              updated_at: {
                gte: startOfWeek(new Date()),
                lte: endOfWeek(new Date()),
              },
              status: "published",
            },
          },
        }),
      };
    }

    const stories = await prisma.stories.findMany({
      where: whereCondition,
      select: {
        story_id: true,
        title: true,
        category: true,
        verticalImage: true,
        views: true,
        _count: {
          select: {
            chapter: true,
          },
        },
      },
      orderBy: {
        views: "desc",
      },
      skip: offset,
      take: limit,
    });

    const totalStories = await prisma.stories.count({
      where: whereCondition,
    });

    return NextResponse.json({
      stories: stories.map((story) => ({
        story_id: story.story_id,
        title: story.title,
        category: story.category,
        verticalImage: story.verticalImage,
        views: story.views,
        chapterCount: story._count.chapter,
      })),
      pagination: {
        page,
        limit,
        total: totalStories,
        totalPages: Math.ceil(totalStories / limit),
        hasNext: offset + limit < totalStories,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}
