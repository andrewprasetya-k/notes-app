import { useState, useEffect } from 'react';
import { supabase } from '../../lib/SupabaseClient';

function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNotes() {
      const { data, error } = await supabase
        .from('notes') // Ganti 'notes' dengan nama tabel Anda
        .select('*');

      if (error) {
        console.error('Error fetching notes:', error.message, error.details);
      } else if (data) {
        setNotes(data);
      }
    }

    fetchNotes();
  }, []);

  return (
    <div>
      <h1>Notes</h1>
      {notes.length === 0 ? (
        <p>No notes found.</p>
      ) : (
        <ul>
          {notes.map(note => (
            <li key={note.id}>
              <pre>{JSON.stringify(note, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotesPage;
