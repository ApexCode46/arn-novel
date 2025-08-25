import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

  // สร้าง where clause สำหรับ story
    let storyWhereClause = {
      status: "published"
    };

    if (category !== 'all') {
      storyWhereClause.category = {
        contains: category
      };
    }

    // Run both groupBy operations in a transaction to avoid extra
    // connection overhead and potential engine race conditions.
    const [favoriteData, totalCount] = await prisma.$transaction([
      prisma.favorite.groupBy({
        by: ["story_id"],
        _count: {
          story_id: true,
        },
        where: {
          story_id: { not: null },
          story: storyWhereClause
        },
        orderBy: {
          _count: {
            story_id: "desc",
          },
        },
        skip: skip,
        take: limit,
      }),
      prisma.favorite.groupBy({
        by: ["story_id"],
        _count: {
          story_id: true,
        },
        where: {
          story_id: { not: null },
          story: storyWhereClause
        },
      })
    ]);

    const storyIds = favoriteData.map((item) => item.story_id);

    if (storyIds.length === 0) {
      return NextResponse.json({ 
        stories: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Get story details
    const stories = await prisma.stories.findMany({
      where: {
        story_id: { in: storyIds },
        status: "published",
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { 
          select: { 
            chapter: true, 
            favorite: true, 
            follow: true 
          } 
        },
      },
    });

    // Create a map for quick lookup
    const storiesMap = new Map(stories.map((s) => [s.story_id, s]));

    // Format the data with ranking
    const formattedStories = favoriteData
      .map((favoriteItem, index) => {
        const story = storiesMap.get(favoriteItem.story_id);
        if (!story) return null;
        
        const rank = (page - 1) * limit + index + 1;
        
        return {
          rank: rank,
          id: story.story_id,
          title: story.title,
          imageUrl: story.verticalImage,
          category: story.category,
          author: story.user?.name || 'ไม่ระบุ',
          penName: story.penName || story.user?.name || 'ไม่ระบุ',
          totalFavorites: favoriteItem._count.story_id || 0,
          totalChapters: story._count?.chapter || 0,
          views: story.views || 0,
          blurb: story.blurb || "",
          tags: story.tags || [],
          type: story.type || 'เรื่องสั้น',
          created_at: story.created_at,
          updated_at: story.updated_at
        };
      })
      .filter(Boolean);

    const totalPages = Math.ceil(totalCount.length / limit);

    return NextResponse.json({ 
      stories: formattedStories,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount.length,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("Error fetching ranking stories:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
