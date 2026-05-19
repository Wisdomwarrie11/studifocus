import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useApp } from "../context/AppContext";

const FlashcardsSection: React.FC = () => {
  const { flashCards, addFlashCard } = useApp();
  const [newCardQ, setNewCardQ] = useState("");
  const [newCardInterval, setNewCardInterval] = useState<"hourly" | "daily">(
    "hourly",
  );

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardQ.trim()) {
      addFlashCard(newCardQ, newCardInterval);
      setNewCardQ("");
      alert("Flashcard added!");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
        <Bell className="mr-2 text-brand-orange" size={20} /> Flashcard
        Reminders
      </h3>

      <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
        {flashCards.map((card) => (
          <div
            key={card.id}
            className="bg-yellow-50 p-3 rounded-lg border border-yellow-100"
          >
            <p className="text-sm font-medium text-gray-800">
              {card.content}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase">
              {card.reminderInterval}
            </p>
          </div>
        ))}
        {flashCards.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            No reminders set.
          </p>
        )}
      </div>

      <form
        onSubmit={handleAddFlashcard}
        className="space-y-3 border-t border-gray-100 pt-4"
      >
        <input
          type="text"
          placeholder="Reminder note..."
          className="w-full text-sm border border-gray-200 rounded p-2"
          value={newCardQ}
          onChange={(e) => setNewCardQ(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="text-sm border border-gray-200 rounded p-2 flex-1"
            value={newCardInterval}
            onChange={(e) =>
              setNewCardInterval(e.target.value as "hourly" | "daily")
            }
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
          </select>
          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold"
          >
            Set
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardsSection;
