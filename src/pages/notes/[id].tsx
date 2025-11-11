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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {isSaving && <span>Saving...</span>}
          {!isSaving && lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
          {!isSaving && !lastSaved && <span>Auto-save enabled</span>}
        </div>
        <button 
          onClick={handleSave} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save & Close'}
        </button>
      </div>
      <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
    </div>
  );
};

export default NotePage;
