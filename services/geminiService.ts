export const getMotivationalCoach = async (name: string, streak: number, points: number, context: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, streak, points, context }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch coach message');
    }

    const data = await response.json();
    return data.text || `Keep pushing forward, ${name}! Your progress is amazing.`;
  } catch (error) {
    console.error("Gemini Frontend Error:", error);
    return `Keep pushing forward, ${name}! Your progress is amazing.`;
  }
};

export const analyzeProgress = async (activities: any[], readingLogs: any[]): Promise<string> => {
  try {
    const response = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activities, readingLogs }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch analysis');
    }

    const data = await response.json();
    return data.text || "Your study habits show great potential. Stay consistent!";
  } catch (error) {
    console.error("Gemini Analysis Frontend Error:", error);
    return "Analyzing your productivity data... you're off to a solid start!";
  }
};
