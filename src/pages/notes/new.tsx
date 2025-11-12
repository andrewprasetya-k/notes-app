import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/SupabaseClient';
import TiptapEditor from '../../components/TiptapEditor';

interface NewNote {
  id?: string;
  title?: string;
  content?: string;
}

const NewNotePage = () => {
  const router = useRouter();

  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditorChange = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);
  };

  // Autosave function
  const autoSave = useCallback(async () => {
    // Don't save if both title and content are empty
    if (!title && !content) return;

    setIsSaving(true);

    try {
      if (!noteId) {
        // First save - INSERT new note
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title: title || 'Untitled', content }])
          .select()
          .single();

        if (error) {
          console.error('Autosave insert error:', error);
        } else if (data) {
          setNoteId(data.id);
          setLastSaved(new Date());
        }
      } else {
        // Subsequent saves - UPDATE existing note
        const { error } = await supabase
          .from('notes')
          .update({ title: title || 'Untitled', content: content })
          .eq('id', noteId);

        if (error) {
          console.error('Autosave update error:', error);
        } else {
          setLastSaved(new Date());
        }
      }
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title, content]);

  // Autosave effect with debounce
  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for autosave (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, autoSave]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (!noteId) {
        // First save - INSERT
        const { data, error } = await supabase
          .from('notes')
          .insert([{ title: title || 'Untitled', content }])
          .select()
          .single();

        if (error) {
          alert('Error saving note: ' + error.message);
        } else {
          // redirect to homepage
          router.push('/');
        }
      } else {
        // Already saved - UPDATE and redirect
        const { error } = await supabase
          .from('notes')
          .update({ title: title || 'Untitled', content: content })
          .eq('id', noteId);

        if (error) {
          alert('Error saving note: ' + error.message);
        } else {
          router.push('/');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Floating Action Bar */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
        {/* Save Status */}
        <div className="text-xs mr-2">
          {isSaving && (
            <span className="text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              Saving...
            </span>
          )}
          {!isSaving && lastSaved && (
            <span className="text-gray-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {!isSaving && !lastSaved && (
            <span className="text-gray-400">Auto-save enabled</span>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* Action Buttons */}
        <button
          onClick={() => router.push('/')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          title="Back to notes"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save & Close'}
        </button>
      </div>

      {/* Full Screen Editor */}
      <div className="flex-1">
        <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
      </div>
    </div>
  );
};

export default NewNotePage;
