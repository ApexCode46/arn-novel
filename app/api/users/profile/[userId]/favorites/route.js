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
        return NextResponse.json({ favorites: [] });
      }
      
      whereClause = { user_id: user.id };
    } else {
      whereClause = { user_id: userIdentifier };
    }

    // ดึงรายการโปรดของ user
    const favorites = await prisma.favorite.findMany({
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
      }
      // ไม่ใช้ orderBy เพราะ favorite table ไม่มี timestamp fields
    });

    return NextResponse.json({ 
      favorites: favorites.map(fav => ({
        favorite_id: fav.favorite_id,
        // ใช้ story updated_at แทน favorite created_at
        created_at: fav.story.updated_at,
        story: {
          ...fav.story,
          totalChapters: fav.story._count.chapter,
          totalFavorites: fav.story._count.favorite,
          totalFollows: fav.story._count.follow,
          author: fav.story.user
        }
      }))
    });

  } catch (error) {
    console.log("Error fetching user favorites:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
