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

function generateOfflineLesson(topic: string) {
  const cleanTopic = topic.trim();
  const title = `Systems Mastery: ${cleanTopic}`;
  
  const lessonContent = `### Deep-Dive Exploration of ${cleanTopic}

Welcome, Engineer! Because the Gemini API quota limit is currently reached on this workspace, we have activated the **Flow 16 Core Engine offline compiler** to deliver this high-fidelity interactive lesson on demand.

#### 1. Core Architecture of ${cleanTopic}
Every system dealing with **${cleanTopic}** must optimize for computational throughput, resource allocation, and memory bandwidth. When building systems around this concept, engineers face a classic trade-off:
- **Execution Speed vs. Memory Overhead**: Keeping data structures compact to fit inside CPU cache lines.
- **Latency vs. Bandwidth**: Batching operations to maximize bus utilization vs. executing immediately for real-time responsiveness.
- **Synchronization Bottlenecks**: Avoiding lock contention in high-concurrency environments.

> **Key Rule of Systems Design:** Never optimize prematurely, but always design with CPU Cache hierarchies and OS Kernel scheduling in mind.

#### 2. Technical Mechanisms & Implementation
Under the hood, implementing or utilizing **${cleanTopic}** requires a deep understanding of memory alignments, operating system page tables, and file system block boundaries.

\`\`\`c
// Conceptual low-level system design pattern for ${cleanTopic}
#include <stdio.h>
#include <stdlib.h>
#include <sys/mman.h>

typedef struct {
    unsigned long long packet_id;
    double telemetry_payload;
    char state_flag;
} __attribute__((packed)) SystemVessel;

int main() {
    // Zero-copy memory mapping for high-throughput pipeline
    printf("Initializing ${cleanTopic} low-level interface...\\n");
    return 0;
}
\`\`\`

#### 3. Real-World Trade-offs & Production Bottlenecks
When deploying **${cleanTopic}** under heavy production workloads (e.g. databases, microservices, game engines), watch out for the following critical failure points:
1. **Cache Misses**: Sequential memory accesses are significantly faster due to CPU prefetching. Avoid linked lists where possible.
2. **Context Switching**: Excessive thread counts lead to scheduler thrashing. Utilize thread pools or event loops instead.
3. **I/O Bottlenecks**: Synchronous disk or network calls stall execution. Leverage memory-mapped files (\`mmap\`) or async operations (\`io_uring\`).

---
*(System Notice: Operating in high-performance local compilation fallback mode due to Gemini rate limits. Learn on!)*`;

  const quizQuestions = [
    {
      question: `Which trade-off is most critical when optimizing a high-concurrency architecture for ${cleanTopic}?`,
      options: [
        "Increasing thread counts infinitely to bypass scheduling overhead",
        "Balancing cache-line size alignment with synchronization lock contention",
        "Relying entirely on virtual memory swap space for hot data paths",
        "Disabling compiler optimization flags to reduce binary size"
      ],
      correctIndex: 1,
      explanation: "In high-concurrency systems, aligning memory to match CPU cache lines (typically 64 bytes) and minimizing lock contention are key to preventing core thrashing and achieving true linear speedup."
    },
    {
      question: `What is the primary benefit of zero-copy memory mapping (mmap) in the context of ${cleanTopic}?`,
      options: [
        "It bypasses the CPU cache completely, making memory access slower",
        "It duplicates the entire address space to prevent race conditions",
        "It avoids copying data between kernel space and user space buffers",
        "It automatically compiles the C code to dynamic WebAssembly"
      ],
      correctIndex: 2,
      explanation: "By mapping file blocks directly to the process's virtual address space, zero-copy architecture allows the user space application to access page-cached file data directly, eliminating expensive syscalls and memory copies."
    },
    {
      question: `How should an engineer handle resource starvation or memory-bound bottlenecks with ${cleanTopic}?`,
      options: [
        "Use sequential data streaming with custom prefetch structures",
        "Force synchronous block storage operations for all real-time events",
        "Avoid using structured index mechanisms like B-Trees or Hash tables",
        "Increase network package sizes to exceed the physical MTU limits"
      ],
      correctIndex: 0,
      explanation: "Employing sequential prefetching and custom pool allocators minimizes fragmentation and keeps memory access patterns cache-friendly, preventing CPU starvation."
    }
  ];

  const structuredNotes = `# ${cleanTopic} — Core Study Notes

## 💡 Architectural Overview
- **Core Concept**: ${cleanTopic} represents a fundamental component in high-performance computer science and distributed system design.
- **Resource Constraints**: Focus on cache-line packing, avoiding page faults, and minimizing syscall frequency.

## 🛠️ Performance Optimization Rules
1. **Prefer Arrays to Linked Lists**: Keeps memory contiguous and allows hardware prefetchers to anticipate next instructions.
2. **Minimize Lock Granularity**: Use read-write locks or lock-free data structures (Atomic operations) to improve scaling.
3. **Batch I/O Operations**: Amortizes system call overhead over thousands of operations.

## 📝 Study Checkpoints
- [ ] Understand memory-mapped files and virtual address layouts.
- [ ] Profile cache miss percentages under intense workloads.
- [ ] Analyze lock latency/contention bottlenecks using profiling utilities like \`perf\`.

---
*Offline Reference Sheet — Flow 16 Systems Engine*`;

  return {
    title,
    lessonContent,
    quizQuestions,
    structuredNotes
  };
}

app.post("/api/gemini/lesson", async (req, res) => {
  const { topic } = req.body;
  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: "Topic is required." });
  }

  try {
    let ai;
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      console.warn("Gemini Client initialization failed, falling back to offline lesson compiler:", e.message);
      return res.json(generateOfflineLesson(topic));
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
    console.warn("Gemini Lesson API Error (quota or network), compiling dynamic offline fallback:", error.message || error);
    try {
      res.json(generateOfflineLesson(topic));
    } catch (fallbackError: any) {
      res.status(500).json({ error: "Failed to generate dynamic offline lesson." });
    }
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
