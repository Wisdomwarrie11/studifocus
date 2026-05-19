import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Play,
  Pause,
  PenTool,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../types";

// PDF Viewer Imports
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ReaderOverlayProps {
  item: LibraryItem;
  onClose: () => void;
}

const ReaderOverlay: React.FC<ReaderOverlayProps> = ({ item, onClose }) => {
  const { updateLibraryItemNote, addReadingLog } = useApp();
  
  // Reading Session Timer
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const readingIntervalRef = useRef<number | null>(null);

  // PDF Page State
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Notes Modal state
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.userNotes || "");

  useEffect(() => {
    if (!pdfContainerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(pdfContainerRef.current);
    return () => observer.disconnect();
  }, [item]);

  useEffect(() => {
    if (isReading) {
      readingIntervalRef.current = window.setInterval(() => {
        setReadingSeconds((prev) => prev + 1);
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
      if (window.confirm("Do you want to save this reading session?")) {
        addReadingLog(item.id, item.title, readingSeconds);
      }
    }
    onClose();
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) =>
      Math.min(Math.max(1, prevPageNumber + offset), numPages || 1),
    );
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNotes(e.target.value);
    updateLibraryItemNote(item.id, e.target.value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in text-left">
      {/* Reader Header */}
      <div className="bg-white border-b border-gray-200 p-2 sm:p-4 px-3 sm:px-8 flex flex-col sm:flex-row justify-between items-center shadow-sm space-y-2 sm:space-y-0">
        <div className="flex items-center w-full sm:w-auto overflow-hidden">
          <button
            onClick={handleClose}
            className="mr-2 sm:mr-4 p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex-shrink-0"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-xl font-bold text-gray-800 truncate">
              {item.title}
            </h2>
            <p className="text-[9px] sm:text-sm text-gray-400 uppercase tracking-widest font-medium">
              {item.category}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-50 px-2 sm:px-4 py-1 sm:py-2.5 rounded-xl border border-gray-200 shadow-inner">
            <div
              className={`text-xs sm:text-2xl font-mono font-black ${isReading ? "text-brand-orange" : "text-gray-400"}`}
            >
              {formatTime(readingSeconds)}
            </div>
            <button
              onClick={() => setIsReading(!isReading)}
              className={`p-1.5 sm:p-2 rounded-full text-white transition-all shadow-md active:scale-95 ${isReading ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"}`}
            >
              {isReading ? (
                <Pause size={14} className="sm:w-[16px] sm:h-[16px]" fill="currentColor" />
              ) : (
                <Play size={14} className="sm:w-[16px] sm:h-[16px]" fill="currentColor" />
              )}
            </button>
            <div className="h-5 w-px bg-gray-200"></div>
            <button
              onClick={() => setIsNotesModalOpen(!isNotesModalOpen)}
              className={`p-1.5 sm:p-2 rounded-lg shadow-sm active:scale-90 transition-colors ${isNotesModalOpen ? "bg-brand-orange text-white" : "bg-deep-blue text-white"}`}
              title="Take Notes"
            >
              <PenTool size={14} className="sm:w-[16px] sm:h-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Reader Body */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden bg-gray-100">
        <div className="flex-1 flex flex-col relative h-full overflow-hidden p-2 sm:p-6">
          <div
            className={`mx-auto bg-white shadow-sm rounded-2xl border border-gray-100 flex flex-col relative w-full h-full overflow-hidden ${item.type === "text" ? "max-w-4xl p-5 sm:p-12 overflow-y-auto" : "max-w-6xl"}`}
          >
            {item.type === "pdf" ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-100">
                <div
                  className="flex-1 w-full relative overflow-auto p-4 flex justify-center"
                  ref={pdfContainerRef}
                >
                  <Document
                    file={item.content}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="animate-spin text-brand-orange mb-2" size={32} />
                        <p className="text-sm font-medium text-gray-500">Loading document...</p>
                      </div>
                    }
                    error={
                      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
                        <p className="text-red-600 font-bold">Failed to load PDF</p>
                        <p className="text-xs text-red-400 mt-1">Please try opening in external view.</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={pdfScale}
                      className="shadow-2xl mb-4"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      loading={null}
                      width={containerWidth ? (containerWidth - 40) : undefined}
                    />
                  </Document>
                </div>

                <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                     <button
                      onClick={() => changePage(-1)}
                      disabled={pageNumber <= 1}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => changePage(1)}
                      disabled={numPages ? pageNumber >= numPages : true}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                    <span className="text-sm font-bold text-gray-700 ml-4 font-mono">
                      Page {pageNumber} of {numPages || "--"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-2 mr-4">
                      <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.1))} className="text-xs font-black text-gray-400 hover:text-brand-orange">A-</button>
                      <span className="text-[10px] font-bold text-gray-400 min-w-[30px] text-center">{Math.round(pdfScale * 100)}%</span>
                      <button onClick={() => setPdfScale(s => Math.min(2.0, s + 0.1))} className="text-xs font-black text-gray-400 hover:text-brand-orange">A+</button>
                    </div>
                    <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-brand-orange font-black uppercase tracking-widest hover:underline flex items-center bg-brand-orange/5 px-3 py-1 rounded-lg text-[10px] sm:text-xs">
                      Pop Out <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            ) : item.type === "link" ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <iframe src={item.content} className="w-full h-full border-none bg-white min-h-[1000px]" style={{ minHeight: "1000px", display: "block", width: "100%", height: "100%" }} title={item.title} />
              </div>
            ) : (
              <div className="prose max-w-none prose-orange selection:bg-orange-100">
                <div className="whitespace-pre-wrap leading-relaxed text-gray-800 text-lg">
                  {item.content}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Sidebar */}
        <div className={`${isNotesModalOpen ? "fixed inset-0 z-[70] flex" : "hidden md:flex"} w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-l border-gray-200 flex-col shadow-2xl md:shadow-none transition-all duration-300 md:relative md:z-10`}>
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0">
            <h3 className="font-bold text-blue-950 flex items-center text-sm sm:text-base">
              <PenTool size={16} className="mr-2 text-brand-orange" /> Study Notes
            </h3>
            {isNotesModalOpen && (
              <button onClick={() => setIsNotesModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 md:hidden font-bold flex items-center">
                <span className="mr-1 text-[10px] uppercase tracking-widest font-black">Close</span>
                <X size={20} />
              </button>
            )}
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <textarea 
              className="flex-1 p-5 sm:p-6 resize-none outline-none focus:bg-orange-50/20 transition-colors text-base leading-relaxed"
              placeholder="Type your notes here while you read..."
              value={localNotes}
              onChange={handleNoteChange}
            />
          </div>
          <div className="p-3 bg-gray-50 text-[10px] text-gray-400 text-center border-t border-gray-100 font-medium uppercase tracking-tighter flex-shrink-0">
            Notes are saved automatically
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReaderOverlay;
