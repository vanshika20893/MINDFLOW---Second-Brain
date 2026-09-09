import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextResponse } from "next/server";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ── Structured Output Schema ──────────────────────────────────────────────────

const extractedTaskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: {
      type: Type.STRING,
      description:
        "A clear, concise, actionable task rephrased from the brain dump. Must start with an action verb (e.g. Complete, Review, Call, Submit). Must NOT copy the user's original wording verbatim. Must be understandable in isolation without the surrounding brain dump.",
    },
    type: {
      type: Type.STRING,
      enum: ["TODO", "ROUTINE", "PROJECT", "IDEA"],
      description:
        "TODO = a one-off actionable task. ROUTINE = a recurring habit or daily action. PROJECT = a larger multi-step undertaking. IDEA = a thought worth capturing but not immediately actionable.",
    },
    category: {
      type: Type.STRING,
      description:
        "A short emoji + label category. Use exactly one of: 💼 Work, 📚 Academics, 💻 Coding, 🧠 Wellbeing, 🏠 Home, ✈️ Travel, 🎬 Entertainment, 👥 People, 💰 Finance, 🛒 Errands, 📄 Admin, 💡 Ideas, ⏰ Habits, 📋 General",
    },
    timeframe: {
      type: Type.STRING,
      description:
        "When this task should be done. Use exactly one of: Today, Tonight, Tomorrow, This Week, Next Week, Someday. Infer from context clues in the brain dump (e.g. 'by Friday' → This Week, 'tomorrow' → Tomorrow). Default to 'Today' if no time clue is present.",
    },
    priority: {
      type: Type.STRING,
      enum: ["CRITICAL", "HIGH", "ROUTINE"],
      description:
        "CRITICAL = has a hard deadline today/tomorrow or is explicitly urgent. HIGH = important but not immediately due. ROUTINE = can be done whenever convenient.",
    },
  },
  required: ["text", "type", "category", "timeframe", "priority"],
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "The dominant category of the overall brain dump.",
    },
    priority: { type: Type.STRING, enum: ["CRITICAL", "HIGH", "ROUTINE"] },
    priorityLabel: {
      type: Type.STRING,
      description:
        "A human-readable priority badge: '🔥 Urgent' for CRITICAL, '⚡ Important' for HIGH, '🌱 Routine' for ROUTINE.",
    },
    extractedTasks: {
      type: Type.ARRAY,
      items: extractedTaskSchema,
      description: "Array of extracted, atomic, rephrased tasks.",
    },
  },
  required: ["category", "priority", "priorityLabel", "extractedTasks"],
};

// ── System Instruction ────────────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `You are an expert task extraction AI built into a personal productivity app called MindFlow. Users dump raw, messy, unstructured thoughts into you, and you extract clear, actionable tasks.

## Your Core Behavior

1. READ the entire brain dump first. Understand the overall context, intent, and situation before extracting anything.

2. IDENTIFY every actionable item. An actionable item is anything the user needs to DO — not feelings, observations, or idle thoughts. Look for actions even when they are:
   - buried inside long sentences
   - expressed casually ("gotta", "should probably", "need to somehow")
   - implied rather than stated ("presentation is Monday and I haven't started" → task: "Start preparing the presentation")
   - mixed with emotions or complaints

3. SPLIT compound actions into atomic tasks. Each task must represent ONE independently completable action.
   - "finish the assignment and submit it" → two tasks: "Complete the assignment" + "Submit the assignment"
   - "call Sarah and email the invoice" → two tasks: "Call Sarah" + "Email the invoice"
   - BUT do NOT over-split naturally single actions. "Book a flight to Delhi" is one task, not three.

4. REPHRASE every task into clean, professional language:
   - Start with a clear action verb (Complete, Review, Study, Submit, Call, Email, Schedule, Prepare, etc.)
   - Remove all emotional language, filler words, uncertainty, and complaints
   - Make it understandable WITHOUT the original brain dump
   - "ugh I have to go through those tree questions before the interview" → "Practice tree problems for the interview"
   - "I really need to somehow get started with that React thing" → "Start the React project"

5. PRESERVE important context that makes the task useful:
   - Deadlines: "by Friday", "before Monday", "tomorrow"
   - People: "call Sarah", "email to Acme"
   - Specifics: "DBMS assignment", "Delhi flight", "Figma file"
   - Do NOT strip these. "Call the dentist tomorrow morning about the appointment" should keep all that detail.

6. DEDUPLICATE. If the same task is mentioned multiple times, output it only once (merging any additional context).
   - "I need to finish the assignment. Also, I should get that assignment done tonight." → one task: "Complete the assignment tonight"

7. SKIP non-tasks. Do not extract tasks from:
   - Pure emotions: "I've been feeling really behind lately" → no task
   - Observations: "The weather is nice today" → no task  
   - Idle wondering: "I wonder what happened to that email" → no task (unless it implies "Follow up on that email")

8. INFER implicit tasks when intent is reasonably clear:
   - "Presentation is on Monday and I haven't started" → "Start preparing the presentation"
   - "I'm still waiting on the finance numbers" → "Follow up on the finance numbers"
   - But do NOT hallucinate tasks the user never implied.

## Output Quality Test

Before outputting each task, verify:
- "If I saw ONLY this task in my to-do app, would I immediately know what to do?" If no, rewrite it.
- "Does this task contain exactly ONE action?" If no, split it.
- "Is this a clean rephrasing, not a copy of the user's messy words?" If no, rephrase it.`;

// ── API Route Handler ─────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set in .env.local" },
        { status: 500 }
      );
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    // Try multiple models in order — automatic failover across multiple models to guarantee 100% uptime and prevent quota bottlenecks
    const MODELS_TO_TRY = [
      "gemini-3.6-flash",
      "gemini-3.7-flash",
      "gemini-3.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash"
    ];
    let lastError: any = null;

    for (const model of MODELS_TO_TRY) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Extract tasks from this brain dump:\n\n"${text.trim()}"`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2,
          },
        });

        const metadata = JSON.parse(response.text || "{}");

        if (!metadata.extractedTasks || !Array.isArray(metadata.extractedTasks)) {
          continue; // Try next model
        }

        return NextResponse.json(metadata);
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next available model. Error:`, err?.message || err);
        // Continue to the next model for any error (503 high demand, 429 quota, 404 unavailable, etc.)
        continue;
      }
    }

    // All models failed
    console.error("All models failed. Last error:", lastError);
    return NextResponse.json({ error: lastError?.message || "All models unavailable" }, { status: 503 });
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
