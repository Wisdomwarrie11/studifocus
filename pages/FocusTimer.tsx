import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { LibraryItem } from "../types";

// External Components
import RoadmapWidget from "./RoadmapWidget";
import AnalyticsDashboard from "./AnalyticsDashboard";

// New Extracted Components
import TimerCard from "./TimerCard";
import CoachCard from "./CoachCard";
import JournalSection from "./JournalSection";
import GoalsSection from "./GoalSection";
import FlashcardsSection from "./FlashcardsSection";

import LibrarySidebar from "./LibrarySidebar";
import LibraryGrid from "./LibraryGrid";
import AddMaterialForm from "./AddMaterialForm";
import ReaderOverlay from "./ReaderOverlay";

const FocusTimer: React.FC = () => {
  const { user, logout, libraryItems } = useApp();

  // --- Global View State ---
  const [activeTab, setActiveTab] = useState<
    "focus" | "library" | "roadmap" | "analytics"
  >("focus");

  // Library State
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeReaderItem, setActiveReaderItem] = useState<LibraryItem | null>(null);

  if (!user) return null;

  const categories = [
    "All",
    ...Array.from(new Set(libraryItems.map((item) => item.category))),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? libraryItems
      : libraryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-white">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-deep-blue mb-2 tracking-tight">
            StudiFocus
          </h1>
          <div className="flex items-center space-x-4">
            <p className="text-gray-500">
              Welcome back,{" "}
              <span className="text-brand-orange font-bold font-mono">
                {user.name}
              </span>
            </p>
            <button
              onClick={logout}
              className="text-[10px] uppercase tracking-widest font-black text-gray-400 hover:text-red-500 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl mt-4 md:mt-0 shadow-inner">
          <button
            onClick={() => setActiveTab("focus")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "focus" ? "bg-deep-blue text-white shadow-lg" : "text-gray-500 hover:text-deep-blue"}`}
          >
            Focus
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "library" ? "bg-deep-blue text-white shadow-lg" : "text-gray-500 hover:text-deep-blue"}`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "roadmap" ? "bg-deep-blue text-white shadow-lg" : "text-gray-500 hover:text-deep-blue"}`}
          >
            Roadmap
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "analytics" ? "bg-deep-blue text-white shadow-lg" : "text-gray-500 hover:text-deep-blue"}`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* ======================= FOCUS TIMER TAB ======================= */}
      {activeTab === "focus" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TimerCard />
            <CoachCard />
            <JournalSection />
          </div>
          <div className="space-y-8">
            <GoalsSection />
            <FlashcardsSection />
          </div>
        </div>
      )}

      {/* ======================= LIBRARY TAB ======================= */}
      {activeTab === "library" && !activeReaderItem && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full">
          <LibrarySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isAddingMaterial={isAddingMaterial}
            setIsAddingMaterial={setIsAddingMaterial}
          />
          <div className="lg:col-span-3">
            {isAddingMaterial && (
              <AddMaterialForm onClose={() => setIsAddingMaterial(false)} />
            )}
            <LibraryGrid
              items={filteredItems}
              onOpen={setActiveReaderItem}
              onAddFirst={() => setIsAddingMaterial(true)}
            />
          </div>
        </div>
      )}

      {/* ======================= ROADMAP TAB ======================= */}
      {activeTab === "roadmap" && <RoadmapWidget />}

      {/* ======================= ANALYTICS TAB ======================= */}
      {activeTab === "analytics" && <AnalyticsDashboard />}

      {/* ======================= READER MODE ======================= */}
      {activeTab === "library" && activeReaderItem && (
        <ReaderOverlay
          item={activeReaderItem}
          onClose={() => setActiveReaderItem(null)}
        />
      )}
    </div>
  );
};

export default FocusTimer;
