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

const TiptapEditor = ({ content, title: initialTitle, onChange }: TiptapEditorProps) => 
{
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
        class: 'focus:outline-none',
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

  return(
    <div className="flex flex-col h-screen">
      {/* Title Section - Full Width */}
      <div className="px-6 pt-6 pb-6">
        <input
          value={title}
          onChange={onTitleChange}
          placeholder="Untitled"
          className="w-full text-xl font-bold outline-none border-none focus:outline-none focus:border-none text-gray-900 placeholder-gray-300 leading-tight"
        />
      </div>

      {/* Toolbar - Sticky */}
      <div className="sticky top-0 z-40 bg-white border-y border-gray-200 px-8 py-3 shadow-sm">
        <div className="flex flex-wrap gap-1 items-center max-w-5xl">
          {/* Font size controls */}
          <div className="flex items-center gap-1 mr-3 pr-3 border-r border-gray-300">
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
              className="p-2 rounded-md hover:bg-gray-200 transition-colors"
              title="Decrease font size"
            >
              -
            </button>
          <div className="text-xs text-gray-600 w-10 text-center font-medium">{currentFontSize || '-'}</div>

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
            className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            title="Increase font size"
          >
            +
          </button>
        </div>

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('bold'),
          })}
        >
          <FaBold />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('italic'),
          })}
        >
          <FaItalic />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('underline'),
          })}
        >
          <FaUnderline />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('strike'),
          })}
        >
          <FaStrikethrough />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('codeBlock'),
          })}
        >
          <FaCode />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('blockquote'),
          })}
        >
          <FaQuoteRight />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('bulletList'),
          })}
        >
          <FaListUl />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('orderedList'),
          })}
        >
          <FaListOl />
        </button>

        <button onClick={addLink} className="p-2 rounded-md hover:bg-gray-200 transition-colors">
          <FaLink />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('highlight'),
          })}
        >
          <FaHighlighter />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={clsx('p-2 rounded-md hover:bg-gray-200 transition-colors', {
            'bg-blue-100 text-blue-700': editor.isActive('heading', { level: 2 }),
          })}
        >
          <FaHeading />
        </button>
        
        <div className="border-l border-gray-300 h-6 mx-1"></div>
        
        <button
          onClick={() => {
            // undo/redo buttons
            editor.chain().focus().undo().run();
          }}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
          title="Undo"
        >
          ↶
        </button>

        <button
          onClick={() => {
            editor.chain().focus().redo().run();
          }}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
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
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
          title="Clear formatting"
        >
          ⎚
        </button>
        
        <button
          onClick={() => {
            // remove link on selection
            editor.chain().focus().unsetLink().run();
          }}
          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
          title="Remove link"
        >
          x
        </button>
        </div>
      </div>

      {/* Editor - Full Width with max-width for readability */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
