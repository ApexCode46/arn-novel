import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    const userId = formData.get('userId');

    if (!image || !userId) {
      return NextResponse.json(
        { error: "กรุณาเลือกรูปภาพและระบุ user ID" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์รูปภาพเท่านั้น" },
        { status: 400 }
      );
    }

    // Validate file size (5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ไฟล์รูปต้องมีขนาดไม่เกิน 5MB" },
        { status: 400 }
      );
    }

    // Find user
    let user;
    const userIdentifier = decodeURIComponent(userId).trim();
    
    if (userIdentifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: userIdentifier }
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: userIdentifier }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    // Create unique filename
    const fileExtension = image.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    
    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'profile_user');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
      console.log("Directory already exists or error creating directory:", error);
      return NextResponse.json(
        { error: "ไม่สามารถสร้างไดเรกทอรีสำหรับอัปโหลดได้" },
        { status: 500 }
      );
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update user in database
    const imageUrl = `/profile_user/${fileName}`;
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl }
    });

    return NextResponse.json({ 
      message: "อัปโหลดรูปโปรไฟล์สำเร็จ",
      imageUrl: imageUrl,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    });

  } catch (error) {
    console.log("Error uploading profile image:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปโหลดรูป" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
