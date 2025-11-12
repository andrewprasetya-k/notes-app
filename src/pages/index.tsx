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
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <Link 
            href="/notes/new"
            className="px-5 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium text-sm shadow-sm hover:shadow"
          >
            + New Note
          </Link>
        </div>

        {/* Notes List */}
        <ul className="space-y-2">
          {notes.map((note) => (
            <li 
              key={note.id} 
              className="group bg-gray-50 rounded-2xl p-5 hover:bg-gray-100 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <Link 
                  href={`/notes/${note.id}`}
                  className="flex-1 text-gray-900 hover:text-gray-700 font-medium transition-colors"
                >
                  {note.title}
                </Link>
                <button 
                  type="button" 
                  onClick={() => handleDelete(note.id)}
                  className="ml-4 px-4 py-1.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-6 text-lg">No notes yet</p>
            <Link 
              href="/notes/new"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all font-medium shadow-sm hover:shadow"
            >
              Create your first note
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default NotesPage;
