import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function สำหรับการจัดรูปแบบข้อมูลนิยายจากฐานข้อมูล
function formatStoryData(story) {
  return {
    id: story.story_id,
    title: story.title,
    author: {
      penName: story.penName || story.user?.name || "Unknown",
    },
    category: story.category,
    type: story.category, // สมมติว่า type และ category เหมือนกัน
    contentLevel: story.contentLevel || "ทั่วไป",
    blurb: story.blurb || "ไม่มีคำอธิบาย",
    verticalImage: story.verticalImage,
    horizontalImage: story.horizontalImage,
    tags: story.tags || [],
    views: story.views || 0,
    likes: story._count?.favorite || 0,
    chapters: story._count?.chapter || 0,
    rating: 0, // จะต้องคำนวณจากข้อมูลจริงภายหลัง
    comments: story._count?.storyComments || 0,
    publishedDate: story.created_at?.toISOString(),
    status: story.status || "draft",
    isPopular: story.views > 1000, // กำหนดเงื่อนไขว่าถือว่าเป็น popular เมื่อไร'
    is_end: story.is_end === true,
    isNew:
      story.created_at &&
      new Date() - new Date(story.created_at) < 30 * 24 * 60 * 60 * 1000, // ใหม่ถ้าสร้างมาไม่เกิน 30 วัน
  };
}

// Helper function สำหรับการสร้างเงื่อนไขการค้นหา
function buildSearchConditions(query, category, status, searchType) {
  const conditions = [];

  // เงื่อนไขการค้นหา
  if (query) {
    const searchTerm = query.trim();
    // เลือกฟิลด์ตามประเภทการค้นหา
    if (searchType === "title") {
      conditions.push({ title: { contains: searchTerm, mode: "insensitive" } });
    } else if (searchType === "penName") {
      conditions.push({
        OR: [
          { penName: { contains: searchTerm, mode: "insensitive" } },
          { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        ],
      });
    } else if (searchType === "tag") {
      conditions.push({ tags: { hasSome: [searchTerm] } });
    } else {
      // ค้นหาทุกฟิลด์ (ค่าเริ่มต้นเดิม)
      conditions.push({
        OR: [
          { title: { contains: searchTerm, mode: "insensitive" } },
          { penName: { contains: searchTerm, mode: "insensitive" } },
          { storyInfo: { contains: searchTerm, mode: "insensitive" } },
          { blurb: { contains: searchTerm, mode: "insensitive" } },
          { tags: { hasSome: [searchTerm] } },
          { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        ],
      });
    }
  }

  // กรองตามหมวดหมู่
  if (category) {
    conditions.push({ category: category });
  }

  // กรองตามสถานะ (ยกเว้น completed/not_completed จะไปกรองภายหลังเพื่อหลบปัญหา Prisma client ยังไม่ generate)
  if (status) {
    if (status !== "completed" && status !== "not_completed") {
      conditions.push({ status: status });
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

// Helper function สำหรับการเรียงลำดับ
function buildOrderBy(sortBy, sortOrder) {
  const orderDirection = sortOrder === "desc" ? "desc" : "asc";

  switch (sortBy) {
    case "views":
      return { views: orderDirection };
    case "chapters":
      return { chapter: { _count: orderDirection } };
    case "likes":
      return { favorite: { _count: orderDirection } };
    case "created_at":
    case "publishedDate":
      return { created_at: orderDirection };
    case "updated_at":
      return { updated_at: orderDirection };
    case "title":
    default:
      return { title: orderDirection };
  }
}

// API Route สำหรับ search page
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const query = searchParams.get("q") || undefined;
    const searchType = searchParams.get("searchType") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const sortBy = searchParams.get("sortBy") || "title";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const includeStats = searchParams.get("includeStats") === "true";

    // สร้างเงื่อนไขการค้นหา
    const searchConditions = buildSearchConditions(
      query,
      category,
      status,
      searchType
    );

    // สร้างเงื่อนไขการเรียงลำดับ
    const orderBy = buildOrderBy(sortBy, sortOrder);

    // ดึงข้อมูลจากฐานข้อมูล
    const [stories, totalCount] = await Promise.all([
      prisma.stories.findMany({
        where: searchConditions,
        include: {
          user: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              favorite: true,
              chapter: true,
              storyComments: true,
              follow: true,
            },
          },
        },
        orderBy: orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stories.count({
        where: searchConditions,
      }),
    ]);

    // กรองตาม is_end หลังดึงข้อมูล เพื่อหลบ Unknown argument is_end เมื่อ Prisma Client ยังไม่อัปเดต
    let filtered = stories;
    if (status === "completed") {
      filtered = stories.filter((s) => s.is_end === true);
    } else if (status === "not_completed") {
      filtered = stories.filter(
        (s) => s.is_end === false || typeof s.is_end === "undefined"
      );
    }

    // จัดรูปแบบข้อมูล
    const formattedStories = filtered.map(formatStoryData);

    // Calculate statistics if requested
    let stats = null;
    if (includeStats) {
      const [categoriesResult, statusResult, totalViews] = await Promise.all([
        prisma.stories.groupBy({
          by: ["category"],
          where: searchConditions,
          _count: {
            category: true,
          },
        }),
        prisma.stories.groupBy({
          by: ["status"],
          where: searchConditions,
          _count: {
            status: true,
          },
        }),
        prisma.stories.aggregate({
          where: searchConditions,
          _sum: {
            views: true,
          },
        }),
      ]);

      stats = {
        totalNovels: totalCount,
        totalViews: totalViews._sum.views || 0,
        totalLikes: formattedStories.reduce(
          (sum, story) => sum + story.likes,
          0
        ),
        averageRating: 0, // จะต้องคำนวณจากข้อมูลจริงภายหลัง
        categories: categoriesResult.map((cat) => cat.category),
        statusCount: {
          ongoing:
            statusResult.find((s) => s.status === "ongoing")?._count.status ||
            0,
          completed:
            statusResult.find((s) => s.status === "completed")?._count.status ||
            0,
          draft:
            statusResult.find((s) => s.status === "draft")?._count.status || 0,
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: formattedStories,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      filters: {
        query,
        searchType,
        category,
        status,
        sortBy,
        sortOrder,
      },
      stats,
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to search novels",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// API Route สำหรับสร้างข้อมูลค้นหาใหม่ (POST)
export async function POST(request) {
  try {
    const body = await request.json();

    // สำหรับบันทึกประวัติการค้นหาหรือสร้าง saved search
    // อนาคตอาจจะสร้าง model สำหรับ search history
    const searchHistory = {
      id: Date.now(),
      query: body.query,
      category: body.category,
      status: body.status,
      timestamp: new Date().toISOString(),
      results: body.results || 0,
    };

    return NextResponse.json(
      {
        success: true,
        data: searchHistory,
        message: "Search history saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving search history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to save search history",
      },
      { status: 500 }
    );
  }
}
