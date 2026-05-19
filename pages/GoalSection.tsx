import React, { useState } from "react";
import { CheckSquare, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";

const GoalsSection: React.FC = () => {
  const { dailyGoals, toggleGoal, addGoal } = useApp();
  const [newGoalText, setNewGoalText] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim()) {
      addGoal(newGoalText);
      setNewGoalText("");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-700 mb-1">
        Daily Micro-Goals
      </h3>
      <p className="text-xs text-gray-400 mb-4">
        Check off to earn 10 pts each!
      </p>

      <div className="space-y-3 mb-6">
        {dailyGoals.map((goal) => (
          <div
            key={goal.id}
            className="flex items-start space-x-3 group cursor-pointer"
            onClick={() => toggleGoal(goal.id)}
          >
            <div
              className={`mt-1 transition-colors ${goal.completed ? "text-green-500" : "text-gray-300 group-hover:text-gray-400"}`}
            >
              {goal.completed ? (
                <CheckSquare size={20} />
              ) : (
                <div className="w-5 h-5 border-2 border-current rounded" />
              )}
            </div>
            <p
              className={`text-sm transition-all ${goal.completed ? "text-gray-400 line-through" : "text-gray-700"}`}
            >
              {goal.text}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleAddGoal}
        className="flex items-center space-x-2 border-t border-gray-100 pt-4"
      >
        <input
          type="text"
          placeholder="Add goal..."
          className="flex-1 text-sm border-none outline-none bg-transparent"
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
        />
        <button
          type="submit"
          className="text-brand-orange bg-orange-50 p-2 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
};

export default GoalsSection;
