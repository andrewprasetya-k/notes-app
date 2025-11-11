import { useState, useEffect } from 'react';
import { supabase } from '../lib/SupabaseClient';
import Link from 'next/link';

function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes') // Ganti 'notes' dengan nama tabel Anda
        .select('*');

      if (error) {
        console.error('Error fetching notes:', error);
      } else if (data) {
        setNotes(data);
      }
    }

    fetchNotes();
  }, []);

  const handleDelete = async (id:string)=>{
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting note: ' + error.message);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  }

  return (
    <main className="p-4">
      <ul>
        {notes.map((note) => (
          <li key={note.id} className='p-4 border-b-2'>
            <div>
              <Link href={`/notes/${note.id}`}>{note.title}</Link>
            </div>
            <button type="button" onClick={() => handleDelete(note.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link href="/notes/new">Create New Note</Link>
      </div>
    </main>
  );
}

export default NotesPage;
