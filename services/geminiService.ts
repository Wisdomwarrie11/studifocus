import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getMotivationalCoach = async (
  userName: string,
  streak: number,
  points: number,
  recentActivity: string
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "Keep pushing forward! Your consistency is key.";

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a strict but encouraging study accountability coach. 
      The student, ${userName}, has a ${streak}-day streak and ${points} points.
      Their recent activity: ${recentActivity}.
      
      Generate a short (max 2 sentences), punchy motivational message. 
      If the streak is high, praise discipline. If low, urge them to start.
      Do not use hashtags.`,
    });
    return response.text || "Stay focused and disciplined.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Discipline is choosing between what you want now and what you want most.";
  }
};

export const analyzeProgress = async (
  history: { date: string; score: number }[]
): Promise<string> => {
  const client = getAIClient();
  if (!client) return "Analytics unavailable without API key.";

  try {
    const dataStr = JSON.stringify(history);
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this student's assessment history: ${dataStr}.
      Identify the trend (improving, declining, or plateauing).
      Provide 1 specific actionable advice in bullet points.
      Keep it under 50 words.`,
    });
    return response.text || "Review your past weeks to find weak spots.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistent effort yields the best results.";
  }
};
