import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
  // Run grouping and fetching in a transaction to avoid per-request
  // connect/disconnect and reduce race conditions under high concurrency.
  const top = await prisma.favorite.groupBy({
      by: ["story_id"],
      _count: {
        story_id: true,
      },
      where: {
        story_id: { not: null },
      },
      orderBy: {
        _count: {
          story_id: "desc",
        },
      },
      take: 3,
    });

    const storyIds = top.map((t) => t.story_id);

    if (storyIds.length === 0) {
      return NextResponse.json({ stories: [] });
    }

    const stories = await prisma.stories.findMany({
      where: {
        story_id: { in: storyIds },
        status: "published",
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { chapter: true, favorite: true, follow: true } },
      },
    });

    // order stories according to favorite counts
    const storiesMap = new Map(stories.map((s) => [s.story_id, s]));

    const formatted = top
      .map((t) => {
        const s = storiesMap.get(t.story_id);
        if (!s) return null;
        return {
          id: s.story_id,
          title: s.title,
          imageUrl: s.verticalImage,
          categories: s.category,
          author: s.user?.name || null,
          totalFavorites: t._count.story_id || 0,
          totalChapters: s._count?.chapter || 0,
          views: s.views || 0,
          blurb: s.blurb || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ stories: formatted });
  } catch (error) {
    console.error("Error fetching top favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
