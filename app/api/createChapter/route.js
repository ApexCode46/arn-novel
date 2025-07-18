import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");

    if (!storyId) {
      return NextResponse.json(
        { success: false, error: "Missing storyId query parameter" },
        { status: 400 }
      );
    }

    
    const chapters = await prisma.chapters.findMany({
      where: { 
        storyId: storyId 
      },
      orderBy: {
        order: "asc",
      },
      select: {
        title: true,
        order: true,
        content: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chapters",
      },
      { status: 500 }
    );
  }
}
