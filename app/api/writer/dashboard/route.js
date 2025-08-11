import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const storyId = searchParams.get("storyId");
    const timeframe = searchParams.get("timeframe") || "30d";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Get stories with stats
    const storiesQuery = {
      where: {
        user_id: userId,
        ...(storyId && storyId !== "all" ? { story_id: storyId } : {}),
        ...(timeframe !== "all" ? { updated_at: { gte: startDate } } : {})
      },
      select: {
        story_id: true,
        title: true,
        views: true,
        updated_at: true,
        _count: {
          select: {
            storyComments: true,
            follow: true,
            favorite: true,
            chapter: true
          }
        },
        chapter: {
          select: {
            chapter_id: true,
            title: true,
            order: true,
            views: true,
            price: true,
            _count: {
              select: {
                chapterComments: true,
                transaction: true
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    };

    const stories = await prisma.stories.findMany(storiesQuery);

    // Format story data
    const formattedStories = stories.map(story => ({
      id: story.story_id,
      title: story.title,
      views: story.views,
      comments: story._count.storyComments,
      likes: story._count.favorite,
      followers: story._count.follow,
      updatedAt: story.updated_at.toISOString(),
      chapters: story.chapter.map(chapter => ({
        id: chapter.chapter_id,
        storyId: story.story_id,
        chapter: chapter.order,
        title: chapter.title,
        reads: chapter.views,
        comments: chapter._count.chapterComments,
        coinsTotal: 0, // จะคำนวณภายหลัง
        coinsMonth: 0 // จะคำนวณภายหลัง
      }))
    }));

    // Calculate monthly revenue for the past 12 months
    const monthlyRevenue = [];
    const currentMonth = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0);
      
      // Get transactions for purchase type only (PURCHASE represents buying chapters)
      const monthlyTransactions = await prisma.transaction.aggregate({
        where: {
          type: "PURCHASE",
          payment_status: "SUCCESS",
          chapter: {
            story: {
              user_id: userId,
              ...(storyId && storyId !== "all" ? { story_id: storyId } : {})
            }
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          amount: true
        }
      });

      const monthName = monthStart.toLocaleDateString('th-TH', { month: 'short' });
      monthlyRevenue.push({
        month: monthName,
        coins: monthlyTransactions._sum.amount || 0
      });
    }

    // Calculate current month earnings
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const currentMonthEarnings = await prisma.transaction.aggregate({
      where: {
        type: "PURCHASE",
        payment_status: "SUCCESS",
        chapter: {
          story: {
            user_id: userId,
            ...(storyId && storyId !== "all" ? { story_id: storyId } : {})
          }
        },
        created_at: {
          gte: currentMonthStart
        }
      },
      _sum: {
        amount: true
      }
    });

    // Update chapter coinsMonth and coinsTotal for each story
    for (let story of formattedStories) {
      for (let chapter of story.chapters) {
        // Calculate monthly earnings for this chapter
        const chapterMonthlyEarnings = await prisma.transaction.aggregate({
          where: {
            type: "PURCHASE",
            payment_status: "SUCCESS",
            chapter_id: chapter.id,
            created_at: {
              gte: currentMonthStart
            }
          },
          _sum: {
            amount: true
          }
        });
        
        // Calculate total earnings for this chapter
        const chapterTotalEarnings = await prisma.transaction.aggregate({
          where: {
            type: "PURCHASE",
            payment_status: "SUCCESS",
            chapter_id: chapter.id
          },
          _sum: {
            amount: true
          }
        });
        
        chapter.coinsMonth = chapterMonthlyEarnings._sum.amount || 0;
        chapter.coinsTotal = chapterTotalEarnings._sum.amount || 0;
      }
    }

    return NextResponse.json({
      stories: formattedStories,
      monthlyRevenue,
      currentMonthEarnings: currentMonthEarnings._sum.amount || 0
    });

  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}