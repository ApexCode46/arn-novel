import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "user_id จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    let userIdentifier = decodeURIComponent(userId).trim();
    let whereClause;

    // ตรวจสอบว่า userId เป็น email หรือ user ID
    if (userIdentifier.includes("@")) {
      // หา user จาก email ก่อน
      const user = await prisma.user.findUnique({
        where: { email: userIdentifier },
        select: { id: true }
      });
      
      if (!user) {
        return NextResponse.json({ following: [] });
      }
      
      whereClause = { user_id: user.id };
    } else {
      whereClause = { user_id: userIdentifier };
    }

    // ดึงรายการที่ user กำลังติดตาม
    const following = await prisma.follow.findMany({
      where: whereClause,
      include: {
        story: {
          select: {
            story_id: true,
            title: true,
            blurb: true,
            verticalImage: true,
            views: true,
            status: true,
            created_at: true,
            updated_at: true,
            category: true,
            contentLevel: true,
            tags: true,
            user: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: {
                chapter: true,
                favorite: true,
                follow: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ 
      following: following.map(follow => ({
        follow_id: follow.follow_id,
        followed_at: follow.created_at, // เปลี่ยนชื่อให้สอดคล้องกับ UI
        story: {
          ...follow.story,
          totalChapters: follow.story._count.chapter,
          totalFavorites: follow.story._count.favorite,
          totalFollows: follow.story._count.follow,
          author: follow.story.user
        }
      }))
    });

  } catch (error) {
    console.log("Error fetching user following:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
