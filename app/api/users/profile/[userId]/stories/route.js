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
        return NextResponse.json({ stories: [] });
      }
      
      whereClause = { user_id: user.id };
    } else {
      whereClause = { user_id: userIdentifier };
    }

    // ดึงเรื่องที่ user เขียน
    const stories = await prisma.stories.findMany({
      where: whereClause,
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
        _count: {
          select: {
            chapter: true,
            favorite: true,
            follow: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    return NextResponse.json({ 
      stories: stories.map(story => ({
        ...story,
        totalChapters: story._count.chapter,
        totalFavorites: story._count.favorite,
        totalFollows: story._count.follow
      }))
    });

  } catch (error) {
    console.log("Error fetching user stories:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
