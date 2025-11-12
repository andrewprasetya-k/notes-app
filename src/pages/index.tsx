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
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Notes</h1>
            <p className="text-gray-500 mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Link 
            href="/notes/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
          >
            + New Note
          </Link>
        </div>

        {/* Notes Grid */}
        {notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => {
              // Extract plain text from HTML content for preview
              const plainText = note.content.replace(/<[^>]*>/g, '').substring(0, 150);
              const preview = plainText.length > 150 ? plainText + '...' : plainText;
              
              return (
                <div 
                  key={note.id} 
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
                >
                  <Link 
                    href={`/notes/${note.id}`}
                    className="flex-1 p-6 block"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {note.title || 'Untitled'}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {preview || 'No content'}
                    </p>
                    <div className="mt-4 text-xs text-gray-400">
                      {note.updated_at ? new Date(note.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'No date'}
                    </div>
                  </Link>
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => handleDelete(note.id)}
                      className="text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No notes yet</h2>
              <p className="text-gray-500 mb-6">Start capturing your thoughts and ideas</p>
              <Link 
                href="/notes/new"
                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
              >
                Create your first note
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default NotesPage;
