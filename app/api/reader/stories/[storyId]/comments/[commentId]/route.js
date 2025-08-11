import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update story comment
export async function PUT(request, { params }) {
  try {
    const { commentId } = await params;
    const { content, userId } = await request.json();
    if (!commentId) return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 });
    if (!content || !content.trim()) return NextResponse.json({ success: false, error: 'Comment content is required' }, { status: 400 });
    if (!userId) return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: userId }, select: { id: true, name: true, email: true, image: true } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const existing = await prisma.storyComments.findUnique({ where: { storyComment_id: commentId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    if (existing.user_id !== user.id) return NextResponse.json({ success: false, error: 'You can only edit your own comments' }, { status: 403 });

    const updated = await prisma.storyComments.update({
      where: { storyComment_id: commentId },
      data: { content: content.trim(), updated_at: new Date() },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.storyComment_id,
        content: updated.content,
        created_at: updated.created_at,
        updated_at: updated.updated_at,
        timestamp: new Date(updated.updated_at).toLocaleString('th-TH'),
        user: {
          id: updated.user.email,
          name: updated.user.name || 'ผู้ใช้ไม่ระบุชื่อ',
          image: updated.user.image,
          avatar: (updated.user.name || 'A').charAt(0).toUpperCase(),
          color: 'bg-blue-500'
        }
      }
    });
  } catch (error) {
    console.error('Error updating story comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE story comment
export async function DELETE(request, { params }) {
  try {
    const { commentId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!commentId) return NextResponse.json({ success: false, error: 'Comment ID required' }, { status: 400 });
    if (!userId) return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const existing = await prisma.storyComments.findUnique({ where: { storyComment_id: commentId } });
    if (!existing) return NextResponse.json({ success: false, error: 'Comment not found' }, { status: 404 });
    if (existing.user_id !== user.id) return NextResponse.json({ success: false, error: 'You can only delete your own comments' }, { status: 403 });

    await prisma.storyComments.delete({ where: { storyComment_id: commentId } });

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting story comment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
