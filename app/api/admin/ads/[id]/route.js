import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

// ฟังก์ชันสำหรับลบไฟล์
function deleteFile(filePath) {
  try {
    console.log(`Attempting to delete file: ${filePath}`)
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Successfully deleted file: ${filePath}`)
      return true
    } else {
      console.log(`File not found: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error)
    return false
  }
}

function resolveImagePaths(storedPath) {
  if (!storedPath) return []

  const cleanPath = storedPath.replace(/^\/+/g, '')
  const candidates = new Set()

  candidates.add(path.join(process.cwd(), 'uploads', cleanPath))
  candidates.add(path.join(process.cwd(), 'uploads', 'adsImg', path.basename(cleanPath)))

  return Array.from(candidates)
}

// DELETE - ลบโฆษณา
export async function DELETE(
  request,
  { params }
) {
  try {
    const resolvedParams = await params
    const ad_id = parseInt(resolvedParams.id)
    
    // ดึงข้อมูลโฆษณาก่อนลบเพื่อเอา path รูปภาพ
    const ad = await prisma.ads.findUnique({
      where: { ad_id },
      select: { path_img: true }
    })
    
    if (!ad) {
      return NextResponse.json(
        { error: 'Ad not found' },
        { status: 404 }
      )
    }
    
    // ลบโฆษณาจากฐานข้อมูล
    await prisma.ads.delete({
      where: { ad_id }
    })
    
    // ลบไฟล์รูปภาพถ้ามี
    if (ad.path_img) {
      const candidates = resolveImagePaths(ad.path_img)
      console.log('🗂️ Attempting to delete ad image on delete:', candidates)
      for (const candidate of candidates) {
        deleteFile(candidate)
      }
    }
    
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
    const resolvedParams = await params
    const ad_id = parseInt(resolvedParams.id)
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
