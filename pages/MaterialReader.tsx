import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { Bookmark, BookOpen, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

type Material = {
  id: string;
  title: string;
  type: 'pdf' | 'text';
  content: string; // URL for PDF or markdown text
  readTimeMinutes: number;
};

interface MaterialReaderProps {
  material: Material;
}

const MaterialReader: React.FC<MaterialReaderProps> = ({ material }) => {
  const { addFlashCard } = useApp();
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [bookmarked, setBookmarked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(material.readTimeMinutes * 60);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([...notes, newNote]);
    addFlashCard(newNote, 'daily'); // Add note to flashcards
    setNewNote('');
  };

  const toggleBookmark = () => setBookmarked(!bookmarked);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{material.title}</h2>
        <button
          className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
            bookmarked ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700'
          }`}
          onClick={toggleBookmark}
        >
          <Bookmark size={18} />
          <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
        </button>
      </div>

      <div className="border rounded-xl shadow p-4 max-h-[60vh] overflow-y-auto mb-4">
        {material.type === 'pdf' ? (
          <Document file={material.content} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={currentPage} />
          </Document>
        ) : (
          <ReactMarkdown className="prose max-w-full">{material.content}</ReactMarkdown>
        )}
      </div>

      {material.type === 'pdf' && numPages > 1 && (
        <div className="flex justify-between mb-4">
          <button
            disabled={currentPage <= 1}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          <span>Page {currentPage} / {numPages}</span>
          <button
            disabled={currentPage >= numPages}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Time left: {formatTime(timeLeft)}</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-gray-700">Notes</h3>
        <div className="space-y-2">
          {notes.map((note, idx) => (
            <div key={idx} className="bg-gray-100 p-2 rounded">{note}</div>
          ))}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2 outline-none"
            placeholder="Add a note & save to flashcards"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white px-3 py-2 rounded flex items-center hover:bg-indigo-700"
            onClick={handleAddNote}
          >
            <Plus size={16} />
            <span className="ml-1">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialReader;
