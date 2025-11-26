import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, ExternalLink, FileText, PenTool, Upload } from 'lucide-react';
import { LibraryItem } from '../types';
import { useApp } from '../context/AppContext';
import { formatTime } from './utils/timeUtils';

interface ReaderModalProps {
  item: LibraryItem;
  onClose: () => void;
}

const ReaderModal: React.FC<ReaderModalProps> = ({ item, onClose }) => {
  const { updateLibraryItemNote, addReadingLog } = useApp();
  
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const readingIntervalRef = useRef<number | null>(null);

  // Auto-start reading when modal opens? Maybe manual is better. 
  // Code initialized with manual start capability.

  useEffect(() => {
    if (isReading) {
      readingIntervalRef.current = window.setInterval(() => {
        setReadingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    }
    return () => {
      if (readingIntervalRef.current) clearInterval(readingIntervalRef.current);
    };
  }, [isReading]);

  const handleClose = () => {
    if (readingSeconds > 10) {
      if(window.confirm("Do you want to save this reading session?")) {
        addReadingLog(item.id, item.title, readingSeconds);
      }
    }
    onClose();
  };

  const handleReaderNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateLibraryItemNote(item.id, e.target.value);
    // Note: The context update might not reflect immediately in the prop `item` depending on parent re-render
    // But since `item` is passed by value, we might want local state if we want instant feedback without parent re-render
    // However, for simplicity, we assume text area is uncontrolled or use local state if needed.
    // Ideally, we should use local state for the text area and debounce update to context.
  };
  
  // Local state for notes to ensure smooth typing
  const [localNote, setLocalNote] = useState(item.userNotes);
  const handleLocalNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNote(e.target.value);
    updateLibraryItemNote(item.id, e.target.value);
  }


  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col animate-fade-in">
      {/* Reader Header */}
      <div className="bg-white border-b border-gray-200 p-4 px-8 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center overflow-hidden">
          <button onClick={handleClose} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex-shrink-0">
            <X size={24} />
          </button>
          <div className="truncate">
            <h2 className="text-xl font-bold text-gray-800 truncate">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.category}</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 bg-gray-50 px-6 py-2 rounded-xl border border-gray-200 flex-shrink-0">
          <div className={`text-2xl font-mono font-bold ${isReading ? 'text-indigo-600' : 'text-gray-400'}`}>
            {formatTime(readingSeconds)}
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <button 
            onClick={() => setIsReading(!isReading)}
            className={`p-2 rounded-full text-white transition-colors ${isReading ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isReading ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          {readingSeconds > 0 && (
              <button onClick={handleClose} className="text-red-500 font-semibold text-sm hover:underline hidden md:block">
                Stop & Save
              </button>
          )}
        </div>
      </div>

      {/* Reader Body */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Content Area */}
          <div className="flex-1 bg-gray-50 p-0 lg:p-6 overflow-hidden flex flex-col">
            <div className="w-full h-full bg-white shadow-sm rounded-none lg:rounded-xl overflow-hidden relative">
              {item.type === 'link' ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ExternalLink size={64} className="text-indigo-200 mb-6" />
                  <h3 className="text-xl font-bold text-gray-800 mb-4">External Resource</h3>
                  <p className="text-gray-500 mb-8 max-w-md">This material is hosted externally. Keep this timer running to track your reading.</p>
                  <a 
                  href={item.content.startsWith('http') ? item.content : `https://${item.content}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform hover:-translate-y-1"
                  >
                    Open Link <ExternalLink size={18} className="ml-2" />
                  </a>
                </div>
              ) : item.fileType === 'application/pdf' ? (
                  <iframe 
                    src={item.content} 
                    className="w-full h-full border-none" 
                    title="PDF Viewer"
                  />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileText size={64} className="text-indigo-200 mb-6" />
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{item.fileName}</h3>
                    <p className="text-gray-500 mb-8 max-w-md">This file type cannot be previewed directly in the browser.</p>
                    <a 
                      href={item.content} 
                      download={item.fileName || "download"}
                      className="inline-flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-transform hover:-translate-y-1"
                    >
                      Download File <Upload size={18} className="ml-2 transform rotate-180" />
                    </a>
                </div>
              )}
            </div>
          </div>

          {/* Notes Sidebar */}
          <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col h-1/3 lg:h-full shadow-xl z-20">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center">
                <PenTool size={16} className="mr-2 text-indigo-500" /> Study Notes
              </h3>
            </div>
            <textarea 
              className="flex-1 p-4 resize-none outline-none focus:bg-indigo-50/30 transition-colors"
              placeholder="Type your notes here while you read..."
              value={localNote}
              onChange={handleLocalNoteChange}
            />
            <div className="p-3 bg-gray-50 text-xs text-gray-400 text-center border-t border-gray-100">
              Notes are saved automatically
            </div>
          </div>
      </div>
    </div>
  );
};

export default ReaderModal;
