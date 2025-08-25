import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - ลบผู้ใช้
export async function DELETE(request, { params }) {
  try {
    const userId = params.id
    
    // ลบ wallet และข้อมูลที่เกี่ยวข้องก่อน
    await prisma.wallet.deleteMany({
      where: { user_id: userId }
    })
    
    // ลบผู้ใช้
    await prisma.user.delete({
      where: { id: userId }
    })
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตข้อมูลผู้ใช้
export async function PUT(request, { params }) {
  try {
    const userId = params.id
    const body = await request.json()
    const { name, email, role, image } = body
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        role,
        image,
      },
      include: {
        wallet: {
          select: { balance: true }
        },
        _count: {
          select: {
            stories: true,
            storyComments: true,
            chapterComments: true
          }
        }
      }
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
