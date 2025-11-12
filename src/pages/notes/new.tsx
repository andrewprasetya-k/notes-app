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
    <main className="p-4">
      <div className="mb-2 text-sm text-gray-600">
        {isSaving && <span>Saving...</span>}
        {!isSaving && lastSaved && (
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        )}
        {!isSaving && !lastSaved && <span>Not saved yet</span>}
      </div>
      <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save & Close'}
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-600 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </main>
  );
};

export default NewNotePage;
