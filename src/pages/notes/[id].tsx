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
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
  {/* Header */}
  <div className="bg-gray-50 sticky top-0 z-10">
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between">
        {/* Save Status */}
        <div className="text-sm">
          {isSaving && (
            <span className="text-gray-500 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
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

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          {isSaving ? 'Saving...' : 'Save & Close'}
        </button>
      </div>
    </div>
  </div>

  {/* Editor Content */}
  <div className="max-w-4xl mx-auto px-6 py-8">
    <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
  </div>
</div>
  );
};

export default NotePage;
