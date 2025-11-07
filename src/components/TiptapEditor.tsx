'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import  FontSize  from 'tiptap-fontsize-extension';
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
  onChange: (title: string, content: string) => void;
}

const TiptapEditor = ({ content, onChange }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender:false,
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),
      Highlight,
      Placeholder.configure({
        placeholder: 'Tulis catatanmu di sini...',
      }),
  TextStyle,
  // Set global default font size to 12px; headings created on startup will be set to 14px explicitly.
  FontSize.configure({ defaultSize: '12px' }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose-xl sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[300px] p-4 bg-white',
      },
    },
    onCreate: ({ editor }) => {
      const { doc } = editor.state;
      // guard against null/undefined firstChild
      if (
        doc.childCount === 1 &&
        doc.firstChild?.isText &&
        (doc.firstChild?.textContent?.length ?? 0) > 0
      ){
        // Create a heading and immediately apply a fontSize mark of 14px to its content.
        editor.chain().focus().setNode('heading', { level: 1 }).setMark('fontSize', { size: '18px' }).run();
      }
    },
    onUpdate: ({ editor }) => {
      const firstLine = editor.state.doc.firstChild?.textContent || '';
      onChange(firstLine, editor.getHTML());
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
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2">
        <select
          onChange={(e) => {
            const size = e.target.value;
            // Ensure editor is focused first using the plain command API
            // (avoid potential timing/chain exposure issues).
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (editor.commands as any).focus?.();

            // Try the extension's command first.
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const applied = (editor.commands as any).setFontSize?.(size);

            // Fallback: if the command wasn't available or didn't apply, set the mark directly
            // via the chain API using the mark name used by the extension ('fontSize').
            if (!applied) {
              editor.chain().focus().setMark('fontSize', { size }).run();
            }
          }}
          className="p-2 rounded hover:bg-gray-200"
        >
          <option value="">Font Size</option>
          <option value="12px">12</option>
          <option value="14px">14</option>
          <option value="16px">16</option>
          <option value="18px">18</option>
          <option value="24px">24</option>
          <option value="30px">30</option>
          <option value="36px">36</option>
        </select>

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