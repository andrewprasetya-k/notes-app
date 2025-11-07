'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { useCallback } from 'react';
import clsx from 'clsx';
import {
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaUnderline,
  FaCode,
  FaQuoteRight,
  FaListUl,
  FaListOl,
  FaLink,
  FaHighlighter,
  FaHeading,
} from 'react-icons/fa';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender:false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Tulis catatanmu di sini...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] p-4 rounded-xl border border-gray-300 bg-white shadow-sm',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center border rounded-lg bg-gray-50 p-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('bold'),
          })}
        >
          <FaBold />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('italic'),
          })}
        >
          <FaItalic />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('underline'),
          })}
        >
          <FaUnderline />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('strike'),
          })}
        >
          <FaStrikethrough />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('codeBlock'),
          })}
        >
          <FaCode />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('blockquote'),
          })}
        >
          <FaQuoteRight />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('bulletList'),
          })}
        >
          <FaListUl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('orderedList'),
          })}
        >
          <FaListOl />
        </button>

        <button onClick={addLink} className="p-2 rounded hover:bg-gray-200">
          <FaLink />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('highlight'),
          })}
        >
          <FaHighlighter />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={clsx('p-2 rounded hover:bg-gray-200', {
            'bg-gray-300': editor.isActive('heading', { level: 2 }),
          })}
        >
          <FaHeading />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
