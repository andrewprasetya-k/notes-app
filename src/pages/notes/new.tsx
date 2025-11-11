import { useState, useEffect } from 'react';
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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleEditorChange = (newTitle: string, newContent: string) => {
    setTitle(newTitle);
    setContent(newContent);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('notes')
        .insert([{ title: title || 'Untitled', content }])
        .select()
        .single();

      if (error) {
        alert('Error saving note: ' + error.message);
      } else {
        // redirect to homepage or newly created note
        router.push('/');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4">
  <h1 className="text-xl font-semibold mb-4">Create a new note</h1>
  <TiptapEditor content={content} title={title} onChange={handleEditorChange} />
      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </main>
  );
};

export default NewNotePage;
