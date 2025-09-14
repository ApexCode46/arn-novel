import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET story comments
export async function GET(request, { params }) {
  try {
    const { storyId } = await params;
    if (!storyId) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 50); // max 50
    const cursor = searchParams.get('cursor'); // comment id for pagination

    const story = await prisma.stories.findUnique({
      where: { story_id: storyId },
      select: { 
        story_id: true, 
        title: true,
        allowComments: true,
        hideComments: true,
        commentPermission: true
      }
    });
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // ตรวจสอบว่าคอมเมนต์ถูกซ่อนหรือไม่
    if (story.hideComments) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          story, 
          comments: [], 
          totalComments: 0, 
          nextCursor: null,
          commentSettings: {
            allowComments: story.allowComments,
            hideComments: story.hideComments,
            commentPermission: story.commentPermission
          }
        } 
      });
    }

    const whereClause = { story_id: storyId };

    const comments = await prisma.storyComments.findMany({
      where: whereClause,
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { created_at: 'desc' },
      take: limit + 1, // fetch one extra to know if more
      ...(cursor ? { skip: 1, cursor: { storyComment_id: cursor } } : {})
    });

    let nextCursor = null;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem.storyComment_id;
    }

    const formatted = comments.map(c => ({
      id: c.storyComment_id,
      user: {
        id: c.user.email,
        name: c.user.name || 'ผู้ใช้ไม่ระบุชื่อ',
        avatar: (c.user.name || '?').charAt(0).toUpperCase(),
        image: c.user.image,
        color: generateUserColor(c.user.id)
      },
      content: c.content,
      timestamp: formatTimestamp(c.created_at),
      created_at: c.created_at,
      updated_at: c.updated_at
    }));

    const totalCount = await prisma.storyComments.count({ where: whereClause });

    return NextResponse.json({ 
      success: true, 
      data: { 
        story, 
        comments: formatted, 
        totalComments: totalCount, 
        nextCursor,
        commentSettings: {
          allowComments: story.allowComments,
          hideComments: story.hideComments,
          commentPermission: story.commentPermission
        }
      } 
    });
  } catch (error) {
    console.error('Error fetching story comments:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

// POST create story comment
export async function POST(request, { params }) {
  try {
    const { storyId } = await params;
    const body = await request.json();
    const { content, userId } = body;

    if (!storyId) return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    if (!content || !content.trim()) return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: userId }, select: { id: true, name: true, email: true, image: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const story = await prisma.stories.findUnique({ 
      where: { story_id: storyId }, 
      select: { 
        story_id: true, 
        allowComments: true, 
        commentPermission: true,
        hideComments: true 
      } 
    });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    // ตรวจสอบว่าเปิดให้คอมเมนต์หรือไม่
    if (!story.allowComments) {
      return NextResponse.json({ error: 'ไม่อนุญาตให้แสดงความคิดเห็นในเรื่องนี้' }, { status: 403 });
    }

    // ตรวจสอบการอนุญาตคอมเมนต์
    if (story.commentPermission === 'followers') {
      // ตรวจสอบว่าผู้ใช้ติดตามเรื่องนี้หรือไม่
      const isFollowing = await prisma.follow.findFirst({
        where: {
          user_id: user.id,
          story_id: storyId
        }
      });
      
      if (!isFollowing) {
        return NextResponse.json({ error: 'เฉพาะผู้ติดตามเรื่องนี้เท่านั้นที่สามารถแสดงความคิดเห็นได้' }, { status: 403 });
      }
    }
    // หาก commentPermission เป็น 'comfortable' หรือ undefined ให้ทุกคนคอมเมนต์ได้

    const newComment = await prisma.storyComments.create({
      data: { content: content.trim(), user_id: user.id, story_id: story.story_id },
      include: { user: { select: { id: true, name: true, email: true, image: true } } }
    });

    const formatted = {
      id: newComment.storyComment_id,
      user: {
        id: newComment.user.email,
        name: newComment.user.name || 'ผู้ใช้ไม่ระบุชื่อ',
        avatar: (newComment.user.name || '?').charAt(0).toUpperCase(),
        image: newComment.user.image,
        color: generateUserColor(newComment.user.id)
      },
      content: newComment.content,
      timestamp: formatTimestamp(newComment.created_at),
      created_at: newComment.created_at,
      updated_at: newComment.updated_at
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error creating story comment:', error);
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}

function generateUserColor(userId) {
  const colors = ['bg-pink-500','bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-red-500','bg-yellow-500','bg-indigo-500','bg-teal-500','bg-cyan-500'];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatTimestamp(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'เมื่อสักครู่';
  if (diff < 3600) return `${Math.floor(diff/60)} นาทีที่แล้ว`;
  if (diff < 86400) return `${Math.floor(diff/3600)} ชั่วโมงที่แล้ว`;
  if (diff < 2592000) return `${Math.floor(diff/86400)} วันที่แล้ว`;
  return `${Math.floor(diff/2592000)} เดือนที่แล้ว`;
}
