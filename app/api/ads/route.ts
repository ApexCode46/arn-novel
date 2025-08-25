import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงโฆษณาที่เปิดใช้งานสำหรับแสดงในหน้าเว็บ
export async function GET() {
  try {
    const ads = await prisma.ads.findMany({
      where: { status: true },
      orderBy: { updated_at: 'desc' },
      select: {
        ad_id: true,
        name_as: true,
        path_img: true,
        link: true,
        updated_at: true
      }
    })
    
    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching public ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    )
  }
}
