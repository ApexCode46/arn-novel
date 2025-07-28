import { NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");
    const storyId = formData.get("storyId");
    const chapterId = formData.get("chapterId")
    const duration = parseFloat(formData.get("duration")) || null;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: "No audio file provided" },
        { status: 400 }
      );
    }

    if (!storyId || !chapterId) {
      return NextResponse.json(
        { success: false, error: "Story ID and Chapter ID are required" },
        { status: 400 }
      );
    }

    // Verify story ownership
    const story = await prisma.stories.findFirst({
      where: {
        story_id: storyId,
        user_id: user.id,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found or access denied" },
        { status: 403 }
      );
    }

    // Verify chapter exists
    const chapter = await prisma.chapters.findFirst({
      where: {
        chapter_id: chapterId,
        story_id: storyId,
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }

    // Check if voice already exists for this chapter
    const existingVoice = await prisma.voice.findFirst({
      where: {
        story_id: storyId,
        chapter_id: chapterId,
        user_id: user.id,
      },
    });

    // If voice exists, delete the old file
    if (existingVoice && existingVoice.file_path) {
      // Remove leading slash from file_path if exists
      const relativePath = existingVoice.file_path.startsWith("/")
        ? existingVoice.file_path.substring(1)
        : existingVoice.file_path;
      const oldFilePath = path.join(process.cwd(), "public", relativePath);
      try {
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
          console.log("Successfully deleted old voice file:", oldFilePath);
        }
      } catch (error) {
        console.warn("Failed to delete old voice file:", error);
      }
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "voice");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(audioFile.name);
    const fileName = `${storyId}_${chapterId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const publicPath = `/voice/${fileName}`;

    // Save file to disk
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    let voiceRecord;

    if (existingVoice) {
      // Update existing voice record
      voiceRecord = await prisma.voice.update({
        where: { voice_id: existingVoice.voice_id },
        data: {
          file_path: publicPath,
          file_name: audioFile.name,
          file_size: audioFile.size,
          duration: duration,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new voice record
      voiceRecord = await prisma.voice.create({
        data: {
          user_id: user.id,
          story_id: storyId,
          chapter_id: chapterId,
          file_path: publicPath,
          file_name: audioFile.name,
          file_size: audioFile.size,
          duration: duration,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        voice_id: voiceRecord.voice_id,
        file_name: voiceRecord.file_name,
        file_path: voiceRecord.file_path,
        duration: voiceRecord.duration,
      },
    });
  } catch (error) {
    console.error("Voice upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - ดึงข้อมูลเสียงพากย์ของ chapter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    const chapterId = searchParams.get("chapterId");

    if (!storyId || !chapterId) {
      return NextResponse.json(
        { success: false, error: "Story ID and Chapter ID are required" },
        { status: 400 }
      );
    }

    const voice = await prisma.voice.findFirst({
      where: {
        story_id: storyId,
        chapter_id: chapterId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!voice) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: "No voice found for this chapter",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        voice_id: voice.voice_id,
        file_name: voice.file_name,
        file_path: voice.file_path,
        duration: voice.duration,
        created_at: voice.created_at,
        user: voice.user,
      },
    });
  } catch (error) {
    console.error("Get voice error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - ลบเสียงพากย์
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get("storyId");
    const chapterId = searchParams.get("chapterId");

    if (!storyId || !chapterId) {
      return NextResponse.json(
        { success: false, error: "Story ID and Chapter ID are required" },
        { status: 400 }
      );
    }

    // Verify story ownership
    const story = await prisma.stories.findFirst({
      where: {
        story_id: storyId,
        user_id: user.id,
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found or access denied" },
        { status: 403 }
      );
    }

    // Find voice record
    const voice = await prisma.voice.findFirst({
      where: {
        story_id: storyId,
        chapter_id: chapterId,
        user_id: user.id,
      },
    });

    if (!voice) {
      return NextResponse.json(
        { success: false, error: "Voice not found" },
        { status: 404 }
      );
    }

    // Delete file from disk
    if (voice.file_path) {
      // Remove leading slash from file_path if exists
      const relativePath = voice.file_path.startsWith("/")
        ? voice.file_path.substring(1)
        : voice.file_path;
      const filePath = path.join(process.cwd(), "public", relativePath);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log("Successfully deleted voice file:", filePath);
        }
      } catch (error) {
        console.warn("Failed to delete voice file:", error);
      }
    }

    // Delete voice record from database
    await prisma.voice.delete({
      where: { voice_id: voice.voice_id },
    });

    return NextResponse.json({
      success: true,
      message: "Voice deleted successfully",
    });
  } catch (error) {
    console.error("Delete voice error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
