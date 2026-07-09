import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI so it doesn't crash on boot if the key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API routes FIRST
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, highThinkingEnabled } = req.body;
    
    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Gemini API key is not configured." });
    }

    const contents = history || [];
    contents.push({ role: "user", parts: [{ text: message }] });

    let response;
    let groundingMetadata;

    if (highThinkingEnabled) {
      try {
        // Use gemini-3.1-pro-preview with high thinking for deep systems reasoning
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents,
          config: {
            systemInstruction: "You are Flow 16's AI Copilot, a high-intelligence systems and AI architect reasoning engine. Your thinking level is set to HIGH to solve extremely complex questions. Help the user master high-performance systems engineering, low-level optimizations (C/C++, Assembly, Linux kernel, mmap, locks), PostgreSQL query optimizations, database design, Docker, Kubernetes, and Machine Learning math. Keep responses extremely concise, structured, and mathematically precise.",
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            }
          }
        });
      } catch (proError: any) {
        console.warn("Pro reasoning model failed or quota exceeded, falling back to gemini-3.5-flash:", proError.message || proError);
        
        // Fallback to gemini-3.5-flash
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: "You are Flow 16's AI Copilot, an elite systems and AI architect tutor. Your goal is to explain complex low-level concepts with beautiful clarity and technical precision. Keep responses concise, structured, and mathematically precise. (Note: Since High-Thinking Pro reasoning is currently unavailable, you are operating as a robust fallback)."
          }
        });

        // Add a visual indicator to let the user know they are using the fallback mode
        const fallbackNotice = "\n\n*(System Notice: Pro-reasoning engine quota limit reached or unavailable on this key. Automatically fell back to fast-mode gemini-3.5-flash. You can configure a paid API key in settings to unlock full HIGH thinking capabilities).*";
        
        response = {
          ...fallbackResponse,
          text: (fallbackResponse.text || "") + fallbackNotice
        };
      }
    } else {
      // Use gemini-3.5-flash with Google Search grounding for up-to-date, accurate systems & tech info
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: "You are Flow 16's AI Copilot, an elite systems and AI architect tutor with real-time web search capabilities. Your thinking level is set to FAST. Help the user with low-level systems engineering, database optimization, or AI math. Use your web search tool to find the most up-to-date and highly accurate technical details (e.g. latest versions, releases, docs, standards, performance benchmarks) and reference them naturally. Keep responses concise, structured, and mathematically precise.",
          tools: [{ googleSearch: {} }],
        }
      });
      groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    }

    res.json({
      text: response.text,
      groundingChunks: groundingMetadata?.groundingChunks || [],
      searchQueries: groundingMetadata?.webSearchQueries || []
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post("/api/gemini/lesson", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required." });
    }

    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      return res.status(400).json({ error: e.message || "Gemini API key is not configured." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a high-quality interactive lesson, 3 multiple-choice quiz questions, and study notes about the topic: "${topic}".`,
      config: {
        systemInstruction: "You are an elite, world-class Systems Engineering Professor and AI systems architect tutor. Your goal is to explain complex low-level concepts with beautiful clarity and technical precision. Use the googleSearch tool to locate real-world reference specifications, performance benchmarks, and industry standard docs when crafting the lesson content. Generate a detailed, highly readable markdown lesson, a 3-question multiple choice quiz to test understanding (with option items, correctIndex, and clear explanations), and a summary set of notes formatted in structured markdown.",
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The official title of the lesson"
            },
            lessonContent: {
              type: Type.STRING,
              description: "The complete, highly detailed educational lesson explained with markdown. Use formatting like bullet points, subheadings, and blockquotes for visual rhythm."
            },
            quizQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctIndex", "explanation"]
              },
              description: "A set of exactly 3 multiple choice questions based on the lesson."
            },
            structuredNotes: {
              type: Type.STRING,
              description: "Structured summary notes in markdown format, perfectly optimized for students to copy or save directly as reference study material."
            }
          },
          required: ["title", "lessonContent", "quizQuestions", "structuredNotes"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Lesson API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Vite middleware for development
async function setupVite() {
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
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
