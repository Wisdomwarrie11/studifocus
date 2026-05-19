import React from "react";
import { Library, Trash2, ExternalLink, BookOpen, ChevronRight, BarChart2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../types";

interface LibraryGridProps {
  items: LibraryItem[];
  onOpen: (item: LibraryItem) => void;
  onAddFirst: () => void;
}

const LibraryGrid: React.FC<LibraryGridProps> = ({ items, onOpen, onAddFirst }) => {
  const { deleteLibraryItem } = useApp();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.length === 0 ? (
        <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <Library size={48} className="mx-auto mb-4 opacity-50" />
          <p>No materials found in this category.</p>
          <button
            onClick={onAddFirst}
            className="mt-2 text-indigo-600 font-semibold hover:underline"
          >
            Add your first item
          </button>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative text-left"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLibraryItem(item.id);
                }}
                className="p-1.5 text-red-100 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-start justify-between mb-4">
              <span className="inline-block px-2 py-1 bg-orange-50 text-brand-orange text-xs font-bold rounded uppercase tracking-wide">
                {item.category}
              </span>
            </div>
            <h3 className="font-bold text-blue-950 mb-2 line-clamp-2 min-h-[3rem] tracking-tight">
              {item.title}
            </h3>
            <div className="flex items-center text-xs text-gray-400 mb-6">
              {item.type === "link" ? (
                <ExternalLink size={14} className="mr-1" />
              ) : item.type === "pdf" ? (
                <BarChart2 size={14} className="mr-1" />
              ) : (
                <BookOpen size={14} className="mr-1" />
              )}
              {item.type === "link" ? "External Link" : item.type === "pdf" ? "PDF Document" : "Text Document"}
              <span className="mx-2 text-gray-200">•</span>
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
            <button
              onClick={() => onOpen(item)}
              className="w-full flex items-center justify-center bg-gray-50 text-gray-700 py-2 rounded-lg font-bold hover:bg-deep-blue hover:text-white transition-all group-hover:shadow-md"
            >
              Open Material <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default LibraryGrid;
