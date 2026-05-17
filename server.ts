import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API initialization
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

  // API Route for Gemini Motivational Coach
  app.post("/api/gemini/coach", async (req, res) => {
    try {
      if (!genAI) {
        return res.status(500).json({ error: "Gemini API key not configured on server" });
      }

      const { name, streak, points, context } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the recommended model alias

      const prompt = `You are a motivational study coach. User ${name} has a ${streak} day streak and ${points} points. 
      The current context is: ${context}. Keep the message short (max 2 sentences), encouraging, and actionable.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      res.json({ text: responseText });
    } catch (error) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  // API Route for Gemini Activity Analysis
  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      if (!genAI) {
        return res.status(500).json({ error: "Gemini API key not configured on server" });
      }

      const { activities, readingLogs } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const activitySummary = activities.map((a: any) => `${a.type} at ${new Date(a.timestamp).toLocaleTimeString()}`).join(', ');
      const readingSummary = readingLogs.map((l: any) => `${l.itemTitle} for ${l.durationSeconds}s`).join(', ');

      const prompt = `Analyze these student activities and reading logs:
      Activities: ${activitySummary}
      Reading: ${readingSummary}
      
      Provide a concise "Smart Analysis" (max 3 sentences) identifying patterns or suggesting improvements for their study habits. 
      Focus on productivity and balance.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      res.json({ text: responseText });
    } catch (error) {
      console.error("Gemini Analysis Server Error:", error);
      res.status(500).json({ error: "Failed to analyze activity" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
