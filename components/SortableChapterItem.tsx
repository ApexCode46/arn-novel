"use client";

import { Settings, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface ChapterItem {
    chapter_id: string;
    order: number;
    title: string;
}

interface SortableChapterItemProps {
    chapter: ChapterItem;
    storyId: string;
    router: AppRouterInstance;
    onOpenSettings: (chapter: ChapterItem) => void;
}

export default function SortableChapterItem({
    chapter,
    storyId,
    router,
    onOpenSettings,
}: SortableChapterItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
            id: chapter.chapter_id,
        });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between gap-2 my-2 p-4 bg-background border rounded group cursor-grab hover:bg-backgroundCustom transition-all"
            {...attributes}
            {...listeners}
        >
            <div
                className="flex-1 cursor-pointer"
                onClick={() => router.push(`/editor/${storyId}/${chapter.order}`)}
            >
                <div className="flex items-center gap-2">
                    <GripVertical className="text-zinc-400 w-4 h-4" />
                    <span>
                        ตอนที่ {chapter.order}: {chapter.title}
                    </span>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onOpenSettings(chapter);
                }}
                className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 opacity-60 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                title="ตั้งค่าตอน"
            >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
            </button>
        </div>
    );
}
