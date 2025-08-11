import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ใช้ Map เพื่อเก็บข้อมูล rate limiting (ในโปรดักชั่นควรใช้ Redis)
const storyViewTracker = new Map();

// ฟังก์ชันสำหรับตรวจสอบ rate limiting สำหรับ story
function shouldIncrementStoryView(identifier, storyId) {
  const key = `${identifier}-story-${storyId}`;
  const now = Date.now();
  const lastView = storyViewTracker.get(key);

  // หากไม่เคยดู หรือดูเมื่อนานกว่า 5 นาทีที่แล้ว ให้เพิ่ม view
  if (!lastView || now - lastView > 5 * 60 * 1000) {
    storyViewTracker.set(key, now);
    return true;
  }

  return false;
}

// ฟังก์ชันสำหรับตรวจสอบ bot/crawler
function isBot(userAgent) {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /whatsapp/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

// ทำความสะอาด cache เก่า ๆ (เรียกทุกๆ 1 ชั่วโมง)
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  for (const [key, timestamp] of storyViewTracker.entries()) {
    if (timestamp < oneHourAgo) {
      storyViewTracker.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function GET(req, { params }) {
  try {
    const { storyId } = await params;

    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    // ดึงข้อมูลนิยายพร้อมข้อมูลผู้เขียนและตอนต่างๆ
    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId,
        status: "published", // แสดงเฉพาะนิยายที่เผยแพร่แล้ว
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        chapter: {
          where: {
            status: "published", // แสดงเฉพาะตอนที่เผยแพร่แล้ว
          },
          orderBy: {
            order: "asc",
          },
          select: {
            chapter_id: true,
            order: true,
            title: true,
            price: true,
            created_at: true,
            updated_at: true,
          },
        },
        _count: {
          select: {
            chapter: {
              where: {
                status: "published", // นับเฉพาะตอนที่เผยแพร่แล้ว
              },
            },
            favorite: true,
            follow: true,
            storyComments: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // ตรวจสอบ rate limiting ก่อนเพิ่ม views
    const clientIP =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ตรวจสอบว่าเป็น bot/crawler หรือไม่
    if (isBot(userAgent)) {
      console.log(
        `Bot detected for story ${storyId}: ${userAgent.slice(0, 100)}`
      );
      // ไม่เพิ่ม view สำหรับ bot แต่ยังคงส่ง response ปกติ
      const responseData = {
        story_id: story.story_id,
        title: story.title,
        blurb: story.blurb,
        category: story.category,
        type: story.type,
        contentLevel: story.contentLevel,
        tags: story.tags,
        storyInfo: story.storyInfo,
        verticalImage: story.verticalImage,
        horizontalImage: story.horizontalImage,
        views: story.views, // ไม่เพิ่ม view
        created_at: story.created_at,
        updated_at: story.updated_at,
        author: {
          id: story.user.id,
          name: story.user.name,
          penName: story.penName,
          image: story.user.image,
        },
        chapters: story.chapter,
        stats: {
          totalChapters: story._count.chapter,
          totalFavorites: story._count.favorite,
          totalFollows: story._count.follow,
          totalComments: story._count.storyComments,
        },
      };

      return NextResponse.json({
        success: true,
        data: responseData,
      });
    }

    // สร้าง identifier ที่เฉพาะเจาะจงกว่า
    const identifier = `${clientIP}-${userAgent.slice(0, 50)}`;

    const shouldIncrement = shouldIncrementStoryView(identifier, storyId);

    let updatedViews = story.views;

    // เพิ่มการนับ views สำหรับ story (หากผ่าน rate limiting)
    if (shouldIncrement) {
      await prisma.stories.update({
        where: {
          story_id: storyId,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      updatedViews = story.views + 1;
      console.log(`Story view incremented for ${storyId} from IP ${clientIP}`);
    } else {
      console.log(
        `Story view blocked for ${storyId} from IP ${clientIP} (rate limited)`
      );
    }

    // จัดรูปแบบข้อมูลที่จะส่งกลับ
    const responseData = {
      story_id: story.story_id,
      title: story.title,
      blurb: story.blurb,
      category: story.category,
      type: story.type,
      contentLevel: story.contentLevel,
      tags: story.tags,
      storyInfo: story.storyInfo,
      verticalImage: story.verticalImage,
      horizontalImage: story.horizontalImage,
      views: updatedViews, // แสดงจำนวน views ที่อัพเดทแล้ว
      created_at: story.created_at,
      updated_at: story.updated_at,
      author: {
        id: story.user.id,
        name: story.user.name,
        penName: story.penName,
        image: story.user.image,
      },
      chapters: story.chapter,
      stats: {
        totalChapters: story._count.chapter,
        totalFavorites: story._count.favorite,
        totalFollows: story._count.follow,
        totalComments: story._count.storyComments,
      },
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
