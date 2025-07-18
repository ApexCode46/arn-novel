"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from "react";
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Minus,
    Expand,
    Shrink,
    Image as ImageIcon,
    Redo,
    Undo,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EditorToolbar = ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
    const [collapsed, setCollapsed] = useState(false);
    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt("URL for image");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <>


            {collapsed ?
                (<div className="sticky top-0 z-10 
        flex justify-end items-center gap-2 p-2
        rounded mb-4">
                    <button className="p-2 rounded-md bg-backgroundCustom transition-colors shadow-md hover:bg-gray-200  hover:text-black" onClick={() => setCollapsed(!collapsed)}>
                        <Expand size={18} />
                    </button>
                </div>) : (
                    <div className="
        sticky top-0 z-10 
        flex flex-wrap items-center gap-2 p-2
     bg-backgroundCustom
        rounded mb-4 shadow-md
    ">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            disabled={!editor.can().chain().focus().toggleBold().run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("bold") ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Bold size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            disabled={!editor.can().chain().focus().toggleItalic().run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("italic") ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Italic size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            disabled={!editor.can().chain().focus().toggleStrike().run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("strike") ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Strikethrough size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("heading", { level: 1 }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Heading1 size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("heading", { level: 2 }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Heading2 size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("heading", { level: 3 }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Heading3 size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("heading", { level: 4 }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Heading4 size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("heading", { level: 5 }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <Heading5 size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setHorizontalRule().run()}
                            className="p-2 rounded-md hover:bg-gray-200 hover:text-black"
                        >
                            <Minus size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("bulletList") ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <List size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive("orderedList") ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200  hover:text-black"
                            )}
                        >
                            <ListOrdered size={18} />
                        </button>

                        <button
                            onClick={addImage}
                            className="p-2 rounded-md hover:bg-gray-200 hover:text-black"
                        >
                            <ImageIcon size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('left').run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive({ textAlign: 'left' }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200 hover:text-black"
                            )}
                        >
                            <AlignLeft size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('center').run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive({ textAlign: 'center' }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200 hover:text-black"
                            )}
                        >
                            <AlignCenter size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().setTextAlign('right').run()}
                            className={cn(
                                "p-2 rounded-md transition-colors",
                                editor.isActive({ textAlign: 'right' }) ? "bg-blue-200 text-blue-800" : "hover:bg-gray-200 hover:text-black"
                            )}
                        >
                            <AlignRight size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().chain().focus().undo().run()}
                            className="p-2 rounded-md hover:bg-gray-200 hover:text-black"
                        >
                            <Undo size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().chain().focus().redo().run()}
                            className="p-2 rounded-md hover:bg-gray-200 hover:text-black"
                        >
                            <Redo size={18} />
                        </button>

                        <div className="ml-auto">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-2 rounded-md hover:bg-gray-200 hover:text-black"
                            >
                                <Shrink size={18} />
                            </button>
                        </div>
                    </div>
                )}
        </>
    );
};

interface TiptapEditorProps {
    content: string;
    onContentChange: (html: string) => void;
}

export function TiptapEditor({ content, onContentChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            StarterKit.configure({
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            Image.configure({
                inline: true,
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4",
            },
            handleKeyDown(view, event) {
                if (event.key === 'Tab') {
                    event.preventDefault()
                    view.dispatch(
                        view.state.tr.insertText('\t\t')
                    )
                    return true
                }
                return false
            },
        },
        immediatelyRender: false,
    });

    
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    return (
        <div>
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}