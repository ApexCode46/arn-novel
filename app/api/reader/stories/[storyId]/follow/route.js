import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET follow status & count
export async function GET(request, { params }) {
  try {
    const { storyId } = await params;
    if (!storyId) return NextResponse.json({ error: 'Story ID required' }, { status: 400 });

    const session = await getServerSession();
    const userEmail = session?.user?.email;

    const story = await prisma.stories.findUnique({
      where: { story_id: storyId, status: 'published' },
      select: { story_id: true, _count: { select: { follow: true } } }
    });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    let isFollowing = false;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
      if (user) {
        const existing = await prisma.follow.findFirst({ where: { user_id: user.id, story_id: storyId } });
        isFollowing = !!existing;
      }
    }

    return NextResponse.json({ success: true, data: { count: story._count.follow, isFollowing } });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error', message: e.message }, { status: 500 });
  }
}

// POST toggle follow
export async function POST(request, { params }) {
  try {
    const { storyId } = await params;
    if (!storyId) return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existing = await prisma.follow.findFirst({ where: { user_id: user.id, story_id: storyId } });
    if (existing) {
      await prisma.follow.delete({ where: { follow_id: existing.follow_id } });
    } else {
      await prisma.follow.create({ data: { user_id: user.id, story_id: storyId } });
    }

    const count = await prisma.follow.count({ where: { story_id: storyId } });
    return NextResponse.json({ success: true, data: { count, isFollowing: !existing } });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error', message: e.message }, { status: 500 });
  }
}
