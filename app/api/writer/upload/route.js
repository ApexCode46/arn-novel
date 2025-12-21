import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const storyId = data.get("storyId");
    const imageType = data.get("imageType"); // "vertical" or "horizontal"

    if (!file || !storyId || !imageType) {
      return NextResponse.json(
        { error: "File, storyId, and imageType are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // สร้างชื่อไฟล์ตามรูปแบบ storyId-ประเภทภาพ
    const fileExtension = file.name.split('.').pop();
    const fileName = `${storyId}-${imageType}.${fileExtension}`;
    
    // เส้นทางสำหรับบันทึกไฟล์
    const path = join(process.cwd(), "uploads", "novelImg", fileName);
    
    // บันทึกไฟล์
    await writeFile(path, buffer);

    return NextResponse.json({
      message: "File uploaded successfully",
      fileName: fileName,
      path: `/novelImg/${fileName}`
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
