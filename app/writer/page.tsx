'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, FC } from 'react';

interface MenuBarProps {
  editor: Editor | null;
}

// Custom toolbar component
const MenuBar: FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-200 font-bold' : 'bg-white'
        }`}
      >
        ตัวหนา
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-200 italic' : 'bg-white'
        }`}
      >
        ตัวเอียง
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('strike') ? 'bg-gray-200 line-through' : 'bg-white'
        }`}
      >
        ขีดฆ่า
      </button>
      <button 
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('paragraph') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        ย่อหน้า
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 font-bold' : 'bg-white'
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 font-bold' : 'bg-white'
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        รายการจุด
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        รายการเลข
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('codeBlock') ? 'bg-gray-200 font-mono' : 'bg-white'
        }`}
      >
        Code Block
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 ${
          editor.isActive('blockquote') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        อ้างอิง
      </button>
      <button 
        onClick={() => editor.chain().focus().undo().run()}
        className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 bg-white"
      >
        ย้อนกลับ
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        className="px-3 py-1 text-sm rounded border border-gray-300 hover:bg-gray-100 bg-white"
      >
        ทำซ้ำ
      </button>
    </div>
  );
};

const TiptapEditor: FC = () => {
  const [content, setContent] = useState<string>('<p>เริ่มพิมพ์ที่นี่...</p>');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">Tiptap Editor สำหรับ Next.js</h1>
      <MenuBar editor={editor} />
      
      <div className="border border-gray-300 rounded-md mb-6 min-h-64">
        <EditorContent editor={editor} className="prose max-w-none p-4 focus:outline-none" />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">HTML Output:</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">{content}</pre>
      </div>
    </div>
  );
};

export default TiptapEditor;