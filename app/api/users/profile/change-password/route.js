import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    // Find user and get their current password
    let user;
    const userIdentifier = decodeURIComponent(userId).trim();

    if (userIdentifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: userIdentifier },
        include: {
          accounts: {
            where: { provider: "local" },
            select: { password: true },
          },
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: userIdentifier },
        include: {
          accounts: {
            where: { provider: "local" },
            select: { password: true },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    // Check if user has a local account (password-based)
    const localAccount = user.accounts.length > 0 ? user.accounts[0] : null;

    console.log("localAccount:", localAccount);
    console.log("user.accounts length:", user.accounts.length);

    if (!localAccount || !localAccount.password) {
      return NextResponse.json(
        { error: "ผู้ใช้นี้ไม่ได้ใช้การเข้าสู่ระบบด้วยรหัสผ่าน" },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      localAccount.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in account table
    await prisma.account.updateMany({
      where: {
        userId: user.id,
        provider: "local",
      },
      data: {
        password: hashedNewPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
