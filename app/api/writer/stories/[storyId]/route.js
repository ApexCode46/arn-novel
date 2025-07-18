import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { storyId } = params;

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    const story = await prisma.stories.findUnique({
      where: {
        story_id: storyId
      },
      select: {
        title: true,
        penName: true,
        blurb: true,
        category: true,
        type: true,
        contentLevel: true,
        tags: true,
        storyInfo: true,
        verticalImage: true,
        hideComments: true,
        horizontalImage: true,
        allowComments: true,
        commentPermission: true,
        created_at: true,
        updated_at: true,
      }
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
    
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { storyId } = params;
    const body = await req.json();
    const { content } = body;

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const updatedStory = await prisma.stories.update({
      where: {
        story_id: storyId,
      },
      data: {
        storyInfo: content,
      },
    });

    if (!updatedStory) {
      return NextResponse.json(
        { error: 'Story not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Story updated successfully',
        data: updatedStory,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


