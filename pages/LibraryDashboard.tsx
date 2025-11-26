import React, { useState } from 'react';
import { Plus, BarChart2, X, ExternalLink, BookOpen, Library, Trash2, ChevronRight, FileText, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LibraryItem } from '../types';

interface LibraryDashboardProps {
  onOpenReader: (item: LibraryItem) => void;
}

const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ onOpenReader }) => {
  const { libraryItems, addLibraryItem, deleteLibraryItem, readingLogs } = useApp();
  
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // New Item Form
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemType, setNewItemType] = useState<'link' | 'file'>('link');
  const [newItemContent, setNewItemContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const categories: string[] = ['All', ...Array.from(new Set(libraryItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'All' ? libraryItems : libraryItems.filter(item => item.category === selectedCategory);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size (approx 10MB limit)
      if (file.size > 10 * 1024 * 1024) {
          alert("File is too large for the library (Max 10MB). Please try a smaller file.");
          e.target.value = '';
          return;
      }
      setUploadFile(file);
    }
  };

  const resetForm = () => {
    setIsAddingMaterial(false);
    setNewItemTitle('');
    setNewItemCategory('');
    setNewItemContent('');
    setUploadFile(null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemCategory) return;

    if (newItemType === 'link') {
        addLibraryItem({
            title: newItemTitle,
            category: newItemCategory,
            type: 'link',
            content: newItemContent
        });
        resetForm();
    } else {
        if (!uploadFile) {
            alert("Please select a file to upload");
            return;
        }
        // In a real app with Firebase, addLibraryItem handles the async upload
        // Here we just pass the file object to context
        try {
            // We'll construct a mock item to pass to the context function
            // The context needs to handle File objects now if updated previously
            // Based on previous step, addLibraryItem accepts the object with content.
            // If the context was updated to handle files, we should use that.
            // Assuming context handles the logic:
             addLibraryItem({
                title: newItemTitle,
                category: newItemCategory,
                type: 'file',
                content: '', // Content will be URL after upload in context
                fileType: uploadFile.type,
                fileName: uploadFile.name,
                file: uploadFile // Pass raw file if supported by context
            } as any);
            
            resetForm();
        } catch (error) {
            console.error(error);
            alert("Failed to upload");
        }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
      {/* Sidebar: Categories & Progress */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <button 
            onClick={() => setIsAddingMaterial(!isAddingMaterial)}
            className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors mb-6 shadow-indigo-100 shadow-lg"
          >
            <Plus size={18} className="mr-2" /> Add Material
          </button>
          
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Courses & Categories</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <span>{cat}</span>
                <span className="bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">
                  {cat === 'All' ? libraryItems.length : libraryItems.filter(i => i.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reading Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 flex items-center mb-4">
            <BarChart2 size={16} className="mr-2 text-indigo-500" /> Recent Sessions
          </h3>
          <div className="space-y-4">
            {readingLogs.slice(0, 5).map(log => (
              <div key={log.id} className="text-sm">
                <p className="text-gray-800 font-medium truncate">{log.itemTitle}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{Math.floor(log.durationSeconds / 60)} mins</span>
                  <span>{new Date(log.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {readingLogs.length === 0 && <p className="text-xs text-gray-400 italic">No reading sessions recorded yet.</p>}
          </div>
        </div>
      </div>

      {/* Main Content: Library Grid */}
      <div className="lg:col-span-3">
        {isAddingMaterial && (
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 mb-8 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-gray-800">Add to Library</h3>
               <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Title of Book / Document" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Course / Category" 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'link' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" name="type" value="link" checked={newItemType === 'link'} onChange={() => setNewItemType('link')} className="hidden" />
                  <ExternalLink size={16} className={newItemType === 'link' ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className={`font-medium ${newItemType === 'link' ? 'text-indigo-800' : 'text-gray-600'}`}>Link URL</span>
                </label>
                <label className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === 'file' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                  <input type="radio" name="type" value="file" checked={newItemType === 'file'} onChange={() => setNewItemType('file')} className="hidden" />
                  <FileText size={16} className={newItemType === 'file' ? 'text-indigo-600' : 'text-gray-400'} />
                  <span className={`font-medium ${newItemType === 'file' ? 'text-indigo-800' : 'text-gray-600'}`}>Upload File</span>
                </label>
              </div>
              
              {newItemType === 'link' ? (
                <input 
                    type="url"
                    placeholder="https://example.com/article"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={newItemContent}
                    onChange={e => setNewItemContent(e.target.value)}
                    required
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                    <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.ppt,.pptx" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="pointer-events-none">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        {uploadFile ? (
                            <p className="text-indigo-600 font-bold">{uploadFile.name}</p>
                        ) : (
                            <>
                                <p className="text-gray-600 font-medium">Click to upload file</p>
                                <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT accepted (Max 10MB)</p>
                            </>
                        )}
                    </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Library size={48} className="mx-auto mb-4 opacity-50" />
              <p>No materials found in this category.</p>
              <button onClick={() => setIsAddingMaterial(true)} className="mt-2 text-indigo-600 font-semibold hover:underline">Add your first item</button>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow group relative flex flex-col h-full">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button onClick={(e) => { e.stopPropagation(); deleteLibraryItem(item.id); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded uppercase tracking-wide truncate max-w-[150px]">
                    {item.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center text-xs text-gray-500 mb-6 mt-auto">
                  {item.type === 'link' ? <ExternalLink size={14} className="mr-1" /> : <FileText size={14} className="mr-1" />}
                  {item.type === 'link' ? 'Link' : (item.fileName?.split('.').pop()?.toUpperCase() || 'FILE')}
                  <span className="mx-2">•</span>
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <button 
                  onClick={() => onOpenReader(item)}
                  className="w-full flex items-center justify-center bg-gray-50 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors group-hover:bg-indigo-600 group-hover:text-white"
                >
                  {item.type === 'file' && item.fileType !== 'application/pdf' ? 'Download / View' : 'Read Now'} 
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryDashboard;