import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - ลบผู้ใช้
export async function DELETE(request, { params }) {
  try {
    const userId = params.id
    
    // ใช้ transaction เพื่อให้แน่ใจว่าทุกอย่างลบได้สำเร็จ
    await prisma.$transaction(async (tx) => {
      // ลบ comment likes ก่อน
      await tx.commentLikes.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ chapter comments ที่เป็น replies ก่อน (เพราะมี self-relation)
      await tx.chapterComments.deleteMany({
        where: { 
          user_id: userId,
          parent_id: { not: null }
        }
      })
      
      // ลบ chapter comments ที่เหลือ
      await tx.chapterComments.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ story comments
      await tx.storyComments.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ favorites
      await tx.favorite.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ follows
      await tx.follow.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ voice files
      await tx.voice.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ transactions ที่เกี่ยวข้องกับ wallet ของ user
      const userWallet = await tx.wallet.findUnique({
        where: { user_id: userId }
      })
      
      if (userWallet) {
        await tx.transaction.deleteMany({
          where: { wallet_id: userWallet.wallet_id }
        })
      }
      
      // ลบ wallet
      await tx.wallet.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ chapters ของ stories ที่เป็นของ user
      const userStories = await tx.stories.findMany({
        where: { user_id: userId },
        select: { story_id: true }
      })
      
      for (const story of userStories) {
        // ลบ transactions ที่เกี่ยวข้องกับ chapters
        await tx.transaction.deleteMany({
          where: { story_id: story.story_id }
        })
        
        // ลบ chapter comments ของ chapters ในเรื่องนี้
        const chapters = await tx.chapters.findMany({
          where: { story_id: story.story_id },
          select: { chapter_id: true }
        })
        
        for (const chapter of chapters) {
          await tx.commentLikes.deleteMany({
            where: { 
              comment: {
                chapter_id: chapter.chapter_id
              }
            }
          })
          
          await tx.chapterComments.deleteMany({
            where: { chapter_id: chapter.chapter_id }
          })
          
          await tx.transaction.deleteMany({
            where: { chapter_id: chapter.chapter_id }
          })
          
          await tx.favorite.deleteMany({
            where: { chapter_id: chapter.chapter_id }
          })
          
          await tx.voice.deleteMany({
            where: { chapter_id: chapter.chapter_id }
          })
        }
        
        // ลบ chapters
        await tx.chapters.deleteMany({
          where: { story_id: story.story_id }
        })
        
        // ลบ story comments, favorites, follows, voice ของเรื่องนี้
        await tx.storyComments.deleteMany({
          where: { story_id: story.story_id }
        })
        
        await tx.favorite.deleteMany({
          where: { story_id: story.story_id }
        })
        
        await tx.follow.deleteMany({
          where: { story_id: story.story_id }
        })
        
        await tx.voice.deleteMany({
          where: { story_id: story.story_id }
        })
      }
      
      // ลบ stories
      await tx.stories.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ ads
      await tx.ads.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ register writer
      await tx.registerWriter.deleteMany({
        where: { user_id: userId }
      })
      
      // ลบ accounts
      await tx.account.deleteMany({
        where: { userId: userId }
      })
      
      // ลบ sessions
      await tx.session.deleteMany({
        where: { userId: userId }
      })
      
      // สุดท้าย ลบผู้ใช้
      await tx.user.delete({
        where: { id: userId }
      })
    })
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user: ' + error.message },
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
