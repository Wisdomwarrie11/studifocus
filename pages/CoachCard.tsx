import React, { useState, useEffect } from "react";
import { Sparkles, Brain, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getMotivationalCoach } from "../services/geminiService";

const CoachCard: React.FC = () => {
  const { user } = useApp();
  const [coachMessage, setCoachMessage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user && !coachMessage) {
      getMotivationalCoach(
        user.name,
        user.streak,
        user.points,
        "Starting a study session",
      ).then(setCoachMessage);
    }
  }, [user, coachMessage]);

  const handleRefreshCoach = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    const msg = await getMotivationalCoach(
      user.name,
      user.streak,
      user.points,
      "Middle of the day checkup",
    );
    setCoachMessage(msg);
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-gradient-to-br from-deep-blue to-blue-900 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles size={120} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
            <Brain size={18} />
          </div>
          <h3 className="font-bold tracking-tight">AI Study Coach</h3>
        </div>
        <p className="text-lg font-medium mb-4 italic leading-relaxed">
          "{coachMessage || "Calculating your next move..."}"
        </p>
        <button
          onClick={handleRefreshCoach}
          disabled={isAnalyzing}
          className="text-xs font-bold uppercase tracking-widest text-brand-orange hover:text-white transition-colors flex items-center"
        >
          <MessageSquare size={14} className="mr-2" />{" "}
          {isAnalyzing ? "Analyzing..." : "Refresh Advice"}
        </button>
      </div>
    </div>
  );
};

export default CoachCard;
