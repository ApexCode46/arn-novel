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
    let user = null;

    console.log("Looking for user with identifier:", userIdentifier);

    // ตรวจสอบว่า userId เป็น email หรือ user ID
    if (userIdentifier.includes("@")) {
      // ถ้าเป็น email ให้ค้นหา user ก่อน
      console.log("Searching by email:", userIdentifier);
      user = await prisma.user.findUnique({
        where: { email: userIdentifier },
        include: {
          wallet: {
            select: { balance: true },
          },
          stories: {
            select: {
              story_id: true,
              title: true,
              views: true,
              created_at: true,
              status: true,
              blurb: true,
              verticalImage: true,
            },
          },
          favorite: {
            include: {
              story: {
                select: {
                  story_id: true,
                  title: true,
                  blurb: true,
                  verticalImage: true,
                  views: true,
                  created_at: true,
                  user: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
          follow: {
            include: {
              story: {
                select: {
                  story_id: true,
                  title: true,
                  blurb: true,
                  verticalImage: true,
                  views: true,
                  created_at: true,
                  user: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } else {
      // ถ้าเป็น user ID ให้ค้นหาตรงๆ
      console.log("Searching by user ID:", userIdentifier);
      user = await prisma.user.findUnique({
        where: { id: userIdentifier },
        include: {
          wallet: {
            select: { balance: true },
          },
          stories: {
            select: {
              story_id: true,
              title: true,
              views: true,
              created_at: true,
              status: true,
              blurb: true,
              verticalImage: true,
            },
          },
          favorite: {
            include: {
              story: {
                select: {
                  story_id: true,
                  title: true,
                  blurb: true,
                  verticalImage: true,
                  views: true,
                  created_at: true,
                  user: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
          follow: {
            include: {
              story: {
                select: {
                  story_id: true,
                  title: true,
                  blurb: true,
                  verticalImage: true,
                  views: true,
                  created_at: true,
                  user: {
                    select: {
                      name: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    // คำนวณสถิติ
    const totalViews = user.stories.reduce(
      (sum, story) => sum + story.views,
      0
    );
    const totalChapters = await prisma.chapters.count({
      where: {
        story: {
          user_id: user.id,
        },
      },
    });

    // นับผู้ติดตามโดยนับจำนวน follow ที่มี story ของ user นี้
    const userStories = await prisma.stories.findMany({
      where: { user_id: user.id },
      select: { story_id: true },
    });

    const storyIds = userStories.map((story) => story.story_id);
    const totalFollowers = await prisma.follow.count({
      where: {
        story_id: { in: storyIds },
      },
    });

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      penName: null, // User model ไม่มี penName field
      bio: null, // User model ไม่มี bio field
      website: null, // User model ไม่มี website field
      location: null, // User model ไม่มี location field
      joinedAt: user.created_at,
      role: user.role,
      wallet: user.wallet ? { balance: user.wallet.balance } : null,
      stats: {
        storiesWritten: user.stories.length,
        chaptersWritten: totalChapters,
        totalViews: totalViews,
        totalFavorites: user.favorite.length,
        totalFollowers: totalFollowers,
        totalFollowing: user.follow.length,
      },
      // เพิ่มรายละเอียดข้อมูลเพิ่มเติม
      stories: user.stories.map((story) => ({
        story_id: story.story_id,
        title: story.title,
        blurb: story.blurb,
        views: story.views,
        status: story.status,
        verticalImage: story.verticalImage,
        created_at: story.created_at,
      })),
      favorites: user.favorite.map((fav) => ({
        story_id: fav.story_id,
        story: fav.story,
      })),
      following: user.follow.map((follow) => ({
        story_id: follow.story_id,
        story: follow.story,
      })),
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "user_id จำเป็นต้องระบุ" },
        { status: 400 }
      );
    }

    let userIdentifier = decodeURIComponent(userId).trim();
    let whereClause;

    // ตรวจสอบว่า user_id เป็น email หรือ user ID
    if (userIdentifier.includes("@")) {
      whereClause = { email: userIdentifier };
    } else {
      whereClause = { id: userIdentifier };
    }

    // อัปเดตข้อมูลผู้ใช้ (เฉพาะ field ที่มีใน schema)
    const updatedUser = await prisma.user.update({
      where: whereClause,
      data: {
        name: name || undefined,
      },
      include: {
        wallet: {
          select: { balance: true },
        },
        stories: {
          select: {
            story_id: true,
            title: true,
            views: true,
            created_at: true,
            status: true,
          },
        },
        favorite: {
          select: {
            story_id: true,
          },
        },
        follow: {
          select: {
            story_id: true,
          },
        },
      },
    });

    // คำนวณสถิติใหม่
    const totalViews = updatedUser.stories.reduce(
      (sum, story) => sum + story.views,
      0
    );
    const totalChapters = await prisma.chapters.count({
      where: {
        story: {
          user_id: updatedUser.id,
        },
      },
    });

    const userStories = await prisma.stories.findMany({
      where: { user_id: updatedUser.id },
      select: { story_id: true },
    });

    const storyIds = userStories.map((story) => story.story_id);
    const totalFollowers = await prisma.follow.count({
      where: {
        story_id: { in: storyIds },
      },
    });

    const profile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      image: updatedUser.image,
      penName: null,
      bio: null,
      website: null,
      location: null,
      joinedAt: updatedUser.created_at,
      role: updatedUser.role,
      wallet: updatedUser.wallet
        ? { balance: updatedUser.wallet.balance }
        : null,
      stats: {
        storiesWritten: updatedUser.stories.length,
        chaptersWritten: totalChapters,
        totalViews: totalViews,
        totalFavorites: updatedUser.favorite.length,
        totalFollowers: totalFollowers,
        totalFollowing: updatedUser.follow.length,
      },
    };

    return NextResponse.json({
      message: "อัปเดตโปรไฟล์สำเร็จ",
      profile,
    });
  } catch (error) {
    console.log("Error updating user profile:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
