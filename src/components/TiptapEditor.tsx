'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import  FontSize  from 'tiptap-fontsize-extension';
import { useCallback, useState, useEffect } from 'react';
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
  title?: string;
  onChange: (title: string, content: string) => void;
}

const TiptapEditor = ({ content, title: initialTitle, onChange }: TiptapEditorProps) => {
  const [title, setTitle] = useState(initialTitle ?? '');
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
      Underline,
      Link,
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
    // no onCreate auto-heading — title is managed via the title input above
    onUpdate: ({ editor }) => {
      // keep editor content in sync; title is provided by the input above
      onChange(title, editor.getHTML());
    },
  });

  // keep local title in sync when parent changes it
  useEffect(() => {
    setTitle(initialTitle ?? '');
  }, [initialTitle]);
  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onChange(newTitle, editor.getHTML());
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Title input */}
      <input
        value={title}
        onChange={onTitleChange}
        placeholder="Masukkan judulmu di sini..."
        className="p-2 mb-2 border rounded"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center bg-gray-50 p-2">
        {/* Font size controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // decrease font size
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const applied = (editor.commands as any).decreaseFontSize?.();
              if (!applied) {
                const current = editor.getAttributes('fontSize')?.size || '12px';
                const newSize = Math.max(1, parseInt(current.replace('px', '')) - 1) + 'px';
                editor.chain().focus().setMark('fontSize', { size: newSize }).run();
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            title="Decrease font size"
          >
            -
          </button>

          <select
            onChange={(e) => {
              const size = e.target.value;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor.commands as any).focus?.();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const applied = (editor.commands as any).setFontSize?.(size);
              if (!applied) {
                editor.chain().focus().setMark('fontSize', { size }).run();
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            value={editor.getAttributes('fontSize')?.size || ''}
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
            onClick={() => {
              // increase font size
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const applied = (editor.commands as any).increaseFontSize?.();
              if (!applied) {
                const current = editor.getAttributes('fontSize')?.size || '12px';
                const newSize = (parseInt(current.replace('px', '')) + 1) + 'px';
                editor.chain().focus().setMark('fontSize', { size: newSize }).run();
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            title="Increase font size"
          >
            +
          </button>
        </div>

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
        
        <button
          onClick={() => {
            // undo/redo buttons
            editor.chain().focus().undo().run();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Undo"
        >
          ↶
        </button>

        <button
          onClick={() => {
            editor.chain().focus().redo().run();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Redo"
        >
          ↷
        </button>

        <button
          onClick={() => {
            // clear formatting: try unsetAllMarks, fallback to unsetting known marks
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (editor.chain() as any).focus().unsetAllMarks()?.run?.();
            } catch (e) {
              editor.chain().focus().unsetMark('fontSize').unsetMark('highlight').unsetMark('textStyle').run();
            }
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Clear formatting"
        >
          ⎚
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;