import { useState, useEffect } from 'react';
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
  const [content, setContent] = useState('');

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
        setContent(data.content);
      }
    };

    fetchNote();
  }, [id]);

  const handleSave = async () => {
    if (!note) return;

    const { error } = await supabase
      .from('notes')
      .update({ content: content })
      .eq('id', note.id);

    if (error) {
      alert('Error saving note: ' + error.message);
    } else {
      alert('Note saved successfully!');
    }
  };

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{note.title}</h1>
      <TiptapEditor content={content} onChange={setContent} />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default NotePage;