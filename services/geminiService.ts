import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMotivationalCoach = async (name: string, streak: number, points: number, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a motivational study coach. User ${name} has a ${streak} day streak and ${points} points. 
      The current context is: ${context}. Keep the message short (max 2 sentences), encouraging, and actionable.`,
    });
    return response.text || `Keep going, ${name}! You're doing great.`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Keep pushing forward, ${name}! Your progress is amazing.`;
  }
};

export const analyzeActivities = async (activities: any[], readingLogs: any[]): Promise<string> => {
    try {
      const activitySummary = activities.map(a => `${a.type} at ${a.timestamp}`).join(', ');
      const readingSummary = readingLogs.map(l => `${l.itemTitle} for ${l.durationSeconds}s`).join(', ');

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze these student activities and reading logs:
        Activities: ${activitySummary}
        Reading: ${readingSummary}
        
        Provide a concise "Smart Analysis" (max 3 sentences) identifying patterns or suggesting improvements for their study habits. 
        Focus on productivity and balance.`,
      });
      return response.text || "Your study habits show great potential. Stay consistent!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Analyzing your productivity data... you're off to a solid start!";
    }
};

export const analyzeProgress = analyzeActivities;
