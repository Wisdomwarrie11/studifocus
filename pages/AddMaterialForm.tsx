import React, { useState } from "react";
import { X, ExternalLink, BookOpen, BarChart2, Plus } from "lucide-react";
import { supabase } from "../src/supabase";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../types";

interface AddMaterialFormProps {
  onClose: () => void;
}

const AddMaterialForm: React.FC<AddMaterialFormProps> = ({ onClose }) => {
  const { user, addLibraryItem } = useApp();
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemType, setNewItemType] = useState<LibraryItem["type"]>("link");
  const [newItemContent, setNewItemContent] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0] &&
      newItemType === "pdf"
    ) {
      setUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle || !newItemCategory) return;

    let finalContent = newItemContent;

    if (newItemType === "pdf") {
      if (!uploadFile) {
        alert("Please select a file to upload");
        return;
      }
      setIsUploading(true);
      try {
        const fileExt = uploadFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("library")
          .upload(filePath, uploadFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("library")
          .getPublicUrl(filePath);

        finalContent = data.publicUrl;
      } catch (error: any) {
        console.error("Upload error:", error);
        finalContent = URL.createObjectURL(uploadFile);
        alert(
          "Note: File is stored locally for this session. Set up Supabase Storage 'library' bucket for permanent storage.",
        );
      }
      setIsUploading(false);
    }

    addLibraryItem({
      title: newItemTitle,
      category: newItemCategory,
      type: newItemType,
      content: finalContent,
    });

    onClose();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 mb-8 animate-fade-in text-left">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Add to Library</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleAddItem} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title of Book / Article"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Course / Category (e.g. History)"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-4">
          <label
            className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === "link" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
          >
            <input
              type="radio"
              name="type"
              value="link"
              checked={newItemType === "link"}
              onChange={() => setNewItemType("link")}
              className="hidden"
            />
            <ExternalLink
              size={16}
              className={
                newItemType === "link" ? "text-orange-500" : "text-gray-400"
              }
            />
            <span
              className={`font-medium ${newItemType === "link" ? "text-orange-600" : "text-gray-600"}`}
            >
              Link URL
            </span>
          </label>
          <label
            className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === "text" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
          >
            <input
              type="radio"
              name="type"
              value="text"
              checked={newItemType === "text"}
              onChange={() => setNewItemType("text")}
              className="hidden"
            />
            <BookOpen
              size={16}
              className={
                newItemType === "text" ? "text-orange-500" : "text-gray-400"
              }
            />
            <span
              className={`font-medium ${newItemType === "text" ? "text-orange-600" : "text-gray-600"}`}
            >
              Paste Text
            </span>
          </label>
          <label
            className={`flex items-center space-x-2 cursor-pointer p-3 border rounded-xl flex-1 ${newItemType === "pdf" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}
          >
            <input
              type="radio"
              name="type"
              value="pdf"
              checked={newItemType === "pdf"}
              onChange={() => setNewItemType("pdf")}
              className="hidden"
            />
            <BarChart2
              size={16}
              className={
                newItemType === "pdf" ? "text-orange-500" : "text-gray-400"
              }
            />
            <span
              className={`font-medium ${newItemType === "pdf" ? "text-orange-600" : "text-gray-600"}`}
            >
              File / PDF
            </span>
          </label>
        </div>

        {newItemType === "pdf" ? (
          <div
            className={`border-4 border-dashed rounded-2xl p-8 text-center transition-all relative group ${dragActive ? "border-brand-orange bg-orange-50/50" : "border-gray-100 hover:border-gray-200 bg-gray-50"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center transition-all ${uploadFile ? "bg-brand-orange text-white" : "bg-white text-gray-300"}`}
              >
                <Plus size={32} />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">
                {uploadFile ? uploadFile.name : "Deposit your study material"}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                Drag and drop or click to upload
              </p>
            </div>
          </div>
        ) : (
          <textarea
            placeholder={
              newItemType === "link"
                ? "https://..."
                : "Paste the article content here..."
            }
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none min-h-[100px]"
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
            required={newItemType !== "pdf"}
          />
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="bg-brand-orange text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-orange/90 transition-colors disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Save to Library"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMaterialForm;
