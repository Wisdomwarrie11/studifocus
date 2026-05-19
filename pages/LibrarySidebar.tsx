import React from "react";
import { Plus, BarChart2 } from "lucide-react";
import { useApp } from "../context/AppContext";

interface LibrarySidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  isAddingMaterial: boolean;
  setIsAddingMaterial: (val: boolean) => void;
}

const LibrarySidebar: React.FC<LibrarySidebarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  isAddingMaterial,
  setIsAddingMaterial,
}) => {
  const { libraryItems, readingLogs } = useApp();

  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={() => setIsAddingMaterial(!isAddingMaterial)}
          className="w-full flex items-center justify-center bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-brand-orange/90 transition-all mb-6 shadow-orange-100 shadow-lg"
        >
          <Plus size={18} className="mr-2" /> Add Material
        </button>

        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Courses & Categories
        </h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-bold transition-colors flex justify-between items-center ${selectedCategory === cat ? "bg-deep-blue text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              <span>{cat}</span>
              <span
                className={`text-[10px] py-0.5 px-2 rounded-full ${selectedCategory === cat ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}
              >
                {cat === "All"
                  ? libraryItems.length
                  : libraryItems.filter((i) => i.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reading Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-bold text-blue-900 flex items-center mb-4">
          <BarChart2 size={16} className="mr-2 text-brand-orange" />{" "}
          Recent Sessions
        </h3>
        <div className="space-y-4">
          {readingLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="text-sm">
              <p className="text-gray-800 font-medium truncate">
                {log.itemTitle}
              </p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{Math.floor(log.durationSeconds / 60)} mins</span>
                <span>{new Date(log.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {readingLogs.length === 0 && (
            <p className="text-xs text-gray-400 italic">
              No reading sessions recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarySidebar;
