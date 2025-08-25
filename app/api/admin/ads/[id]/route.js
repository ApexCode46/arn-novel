import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - ลบโฆษณา
export async function DELETE(
  request,
  { params }
) {
  try {
    const ad_id = parseInt(params.id)
    
    await prisma.ads.delete({
      where: { ad_id }
    })
    
    return NextResponse.json({ message: 'Ad deleted successfully' })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json(
      { error: 'Failed to delete ad' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตสถานะโฆษณา
export async function PUT(
  request,
  { params }
) {
  try {
    const ad_id = parseInt(params.id)
    const { status } = await request.json()
    
    const updatedAd = await prisma.ads.update({
      where: { ad_id },
      data: { status },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    
    return NextResponse.json(updatedAd)
  } catch (error) {
    console.error('Error updating ad status:', error)
    return NextResponse.json(
      { error: 'Failed to update ad status' },
      { status: 500 }
    )
  }
}
