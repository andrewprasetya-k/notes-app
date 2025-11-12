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
  const [currentFontSize, setCurrentFontSize] = useState('font size');
  
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
  // Set global default font size to 14px
  FontSize.configure({ defaultSize: '14px' }),
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
      // Update current font size display - check both fontSize and textStyle
      const fontSize = editor.getAttributes('fontSize')?.size || 
                       editor.getAttributes('textStyle')?.fontSize || '';
      setCurrentFontSize(fontSize);
    },
    onSelectionUpdate: ({ editor }) => {
      // Update font size display when selection changes - check both
      const fontSize = editor.getAttributes('fontSize')?.size || 
                       editor.getAttributes('textStyle')?.fontSize || '';
      setCurrentFontSize(fontSize);
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
        className="p-2 mb-2 text-2xl font-bold outline-none border-none focus:outline-none focus:border-none"
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
                // Get current from editor OR from our display state (which tracks stored marks)
                const editorSize = editor.getAttributes('fontSize')?.size || 
                                   editor.getAttributes('textStyle')?.fontSize;
                const displaySize = currentFontSize && currentFontSize !== '-' ? currentFontSize : null;
                const current = editorSize || displaySize || '14px';
                
                const newSize = Math.max(1, parseInt(current.replace('px', '')) - 1) + 'px';
                editor.chain().focus().setMark('textStyle', { fontSize: newSize }).run();
                // Update display immediately so next click uses this value
                setCurrentFontSize(newSize);
              } else {
                // Update display after command
                setTimeout(() => {
                  const updated = editor.getAttributes('fontSize')?.size || 
                                  editor.getAttributes('textStyle')?.fontSize || '';
                  setCurrentFontSize(updated);
                }, 10);
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            title="Decrease font size"
          >
            -
          </button>
          <div className="text-sm text-gray-600 w-12 text-center">{currentFontSize || '-'}</div>

          <button
            onClick={() => {
              // increase font size
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const applied = (editor.commands as any).increaseFontSize?.();
              if (!applied) {
                // Get current from editor OR from our display state (which tracks stored marks)
                const editorSize = editor.getAttributes('fontSize')?.size || 
                                   editor.getAttributes('textStyle')?.fontSize;
                const displaySize = currentFontSize && currentFontSize !== '-' ? currentFontSize : null;
                const current = editorSize || displaySize || '14px';
                
                const newSize = (parseInt(current.replace('px', '')) + 1) + 'px';
                editor.chain().focus().setMark('textStyle', { fontSize: newSize }).run();
                // Update display immediately so next click uses this value
                setCurrentFontSize(newSize);
              } else {
                // Update display after command
                setTimeout(() => {
                  const updated = editor.getAttributes('fontSize')?.size || 
                                  editor.getAttributes('textStyle')?.fontSize || '';
                  setCurrentFontSize(updated);
                }, 10);
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
            // Try editor.commands.unsetAllMarks when available, otherwise unset common marks
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const unsetAll = (editor.commands as any).unsetAllMarks;
            if (unsetAll) {
              // call it directly
              try {
                (editor.commands as any).unsetAllMarks();
              } catch (e) {
                // fallthrough to individual unset
              }
            }

            // Fallback/unset common marks explicitly
            editor
              .chain()
              .focus()
              .unsetMark('bold')
              .unsetMark('italic')
              .unsetMark('underline')
              .unsetMark('strike')
              .unsetMark('code')
              .unsetMark('link')
              .unsetMark('highlight')
              .unsetMark('fontSize')
              .unsetMark('textStyle')
              .run();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Clear formatting"
        >
          ⎚
        </button>
        
        <button
          onClick={() => {
            // remove link on selection
            editor.chain().focus().unsetLink().run();
          }}
          className="p-2 rounded hover:bg-gray-200"
          title="Remove link"
        >
          ×
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;