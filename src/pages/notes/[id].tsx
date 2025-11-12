import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/SupabaseClient';
import TiptapEditor from '../../components/TiptapEditor';

interface Note {
  id: string;
  title: string;
  content: string;
}

const NotePage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchNote = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
      } else {
        setNote(data);
        setTitle(data.title);
        setContent(data.content);
      }
    };
    fetchNote();
  }, [id]);

  // Autosave function
  const autoSave = useCallback(async () => {
    if (!note) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('notes')
      .update({ title: title, content: content })
      .eq('id', note.id);

    if (error) {
      console.error('Autosave error:', error);
    } else {
      setLastSaved(new Date());
    }
    setIsSaving(false);
  }, [note, title, content]);

  // Autosave effect with debounce
  useEffect(() => {
    if (!note) return;
    
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
  }, [title, content, note, autoSave]);

  const handleEditorChange = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);
  };

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('notes')
      .update({ title: title, content: content })
      .eq('id', note.id);

    if (error) {
      alert('Error saving note: ' + error.message);
    } else {
      setLastSaved(new Date());
      router.push('/'); // redirect ke /dashboard
    }
    setIsSaving(false);
  };

  if (!note) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

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

export default NotePage;
