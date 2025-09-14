import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log('Full session:', JSON.stringify(session, null, 2));
    console.log('Session user:', session?.user);
    console.log('Session user id:', session?.user?.id);
    console.log('Session user sub:', session?.user?.sub);

    if (!session?.user?.id && !session?.user?.sub) {
      console.log('No user ID found in session');
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 401 });
    }

    // ใช้ id หรือ sub ตามที่มี
    const userId = session.user.id || session.user.sub;

    // ดึงข้อมูล wallet พร้อมธุรกรรม
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
      include: {
        transaction: {
          orderBy: { created_at: "desc" },
          take: 20, // แสดง 20 รายการล่าสุด
          include: {
            chapter: {
              select: {
                title: true,
                story: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!wallet) {
      // ตรวจสอบว่า user มีอยู่จริงในฐานข้อมูลก่อน
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        return NextResponse.json(
          { error: "ไม่พบข้อมูลผู้ใช้ในระบบ" }, 
          { status: 404 }
        );
      }

      // หาก wallet ไม่มี ให้สร้างใหม่
      const newWallet = await prisma.wallet.create({
        data: {
          user_id: userId,
          balance: 0,
        },
        include: {
          transaction: {
            orderBy: { created_at: "desc" },
          },
        },
      });

      return NextResponse.json(newWallet);
    }

    return NextResponse.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล wallet" },
      { status: 500 }
    );
  }
}
