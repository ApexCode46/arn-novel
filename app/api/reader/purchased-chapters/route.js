import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const storyId = searchParams.get('story_id');

    if (!userId || !storyId) {
      return NextResponse.json(
        { error: 'user_id และ story_id จำเป็นต้องระบุ' },
        { status: 400 }
      );
    }

    // ค้นหา wallet ของผู้ใช้
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet) {
      return NextResponse.json(
        { purchasedChapters: [] },
        { status: 200 }
      );
    }

    // ดึงข้อมูล transaction ที่เป็นการซื้อบท (PURCHASE) และมี chapter_id ในเรื่องนี้
    const purchasedChapters = await prisma.transaction.findMany({
      where: {
        wallet_id: wallet.wallet_id,
        story_id: storyId,
        type: 'PURCHASE',
        payment_status: 'SUCCESS',
        chapter_id: {
          not: null
        }
      },
      select: {
        transaction_id: true,
        chapter_id: true,
        amount: true,
        created_at: true,
        chapter: {
          select: {
            chapter_id: true,
            title: true,
            order: true,
            price: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      purchasedChapters,
      total: purchasedChapters.length
    });

  } catch (error) {
    console.error('Error fetching purchased chapters:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
