import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        // ดึงนิยายล่าสุดของ user
        const latestStory = await prisma.stories.findFirst({
            where: {
                user_id: userId
            },
            orderBy: {
                created_at: 'desc'
            },
            select: {
                story_id: true,
            }
        });

        if (!latestStory) {
            return NextResponse.json(
                { success: false, error: 'No stories found for this user' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            storyId: latestStory.story_id,
        });

    } catch (error) {
        console.error('Error fetching latest story:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        console.log("Received body:", body);

        const {
        storyId, // optional
        title,
        penName,
        blurb,
        category,
        tags,
        verticalImage,
        horizontalImage,
        hideComments,
        allowComments,
        commentPermission,
        userId,
        } = body;

        let story;

        if (storyId) {
        // ✅ ต้องมีทั้ง update และ create
        story = await prisma.stories.upsert({
            where: { story_id: storyId },
            update: {
            penName,
            title,
            blurb,
            category,
            tags,
            verticalImage,
            horizontalImage,
            hideComments,
            allowComments,
            commentPermission,
            },
            create: {
            story_id: storyId, // กรณีอยากใช้ storyId เดิมสร้างใหม่
            user_id: userId,
            penName,
            title,
            blurb,
            category,
            tags,
            verticalImage,
            horizontalImage,
            hideComments,
            allowComments,
            commentPermission,
            },
        });
        } else {
        // ✅ สร้างใหม่โดยไม่ต้องใส่ story_id (ใช้ cuid อัตโนมัติ)
        story = await prisma.stories.create({
            data: {
            user_id: userId,
            penName,
            title,
            blurb,
            category,
            tags,
            verticalImage,
            horizontalImage,
            hideComments,
            allowComments,
            commentPermission,
            },
        });
        }

        return NextResponse.json({ success: true, story }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
        );
    }
}
