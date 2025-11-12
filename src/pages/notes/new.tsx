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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button & Save Status */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Back to notes"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-sm">
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
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {isSaving ? 'Saving...' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
        </div>
      </div>
    </div>
  );
};

export default NewNotePage;
