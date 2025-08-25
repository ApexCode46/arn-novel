import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET favorite status & count
export async function GET(request, { params }) {
  try {
    const { storyId } = await params;
    if (!storyId) return NextResponse.json({ error: 'Story ID required' }, { status: 400 });

    const session = await getServerSession();
    const userEmail = session?.user?.email;

    const story = await prisma.stories.findUnique({
      where: { story_id: storyId, status: 'published', admin_hidden: false },
      select: { story_id: true, _count: { select: { favorite: true } } }
    });
    if (!story) return NextResponse.json({ error: 'Story not found' }, { status: 404 });

    let isFavorited = false;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true } });
      if (user) {
        const existing = await prisma.favorite.findFirst({ where: { user_id: user.id, story_id: storyId } });
        isFavorited = !!existing;
      }
    }

    return NextResponse.json({ success: true, data: { count: story._count.favorite, isFavorited } });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error', message: e.message }, { status: 500 });
  }
}

// POST toggle favorite
export async function POST(request, { params }) {
  try {
    const { storyId } = await params;
    if (!storyId) return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existing = await prisma.favorite.findFirst({ where: { user_id: user.id, story_id: storyId } });
    if (existing) {
      await prisma.favorite.delete({ where: { favorite_id: existing.favorite_id } });
    } else {
      await prisma.favorite.create({ data: { user_id: user.id, story_id: storyId } });
    }

    const count = await prisma.favorite.count({ where: { story_id: storyId } });
    return NextResponse.json({ success: true, data: { count, isFavorited: !existing } });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error', message: e.message }, { status: 500 });
  }
}
