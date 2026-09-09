export type ItemType = "TODO" | "ROUTINE" | "PROJECT" | "IDEA";

export interface ExtractedTask {
  text: string;
  type: ItemType;
  category: string;
  timeframe?: string;
  priority?: "CRITICAL" | "HIGH" | "ROUTINE";
}

export interface DetectedMetadata {
  category: string;
  priority: "CRITICAL" | "HIGH" | "ROUTINE";
  priorityLabel: string;
  extractedTasks: ExtractedTask[];
}

/**
 * Systematic extraction of thoughts into actionable tasks, recurring routines,
 * creative projects, mental load notes, emotional wellbeing, studies, entertainment, or ideas.
 * 
 * Accurately extracts complex multi-clause stream-of-consciousness dumps such as:
 * "i am sad.... i want to do dsa.... assignment submission tomorrow....book movie ticket ...."
 */
export function detectThoughtMetadata(text: string): DetectedMetadata {
  const lower = text.toLowerCase();

  // 1. Overall Thought Urgency
  let overallPriority: "CRITICAL" | "HIGH" | "ROUTINE" = "ROUTINE";
  let priorityLabel = "🌱 Routine";

  if (
    lower.includes("urgent") ||
    lower.includes("asap") ||
    lower.includes("emergency") ||
    lower.includes("before friday") ||
    lower.includes("deadline") ||
    lower.includes("fight with") ||
    lower.includes("low today") ||
    (lower.includes("tomorrow") && (lower.includes("submission") || lower.includes("assignment") || lower.includes("exam") || lower.includes("presentation")))
  ) {
    overallPriority = "CRITICAL";
    priorityLabel = "🔥 Urgent";
  } else if (
    lower.includes("tomorrow") ||
    lower.includes("tonight") ||
    lower.includes("today") ||
    lower.includes("important") ||
    lower.includes("need to") ||
    lower.includes("have to") ||
    lower.includes("meeting") ||
    lower.includes("soon")
  ) {
    overallPriority = "HIGH";
    priorityLabel = "⚡ High Priority";
  }

  // 2. Clean out verbal junk / prefixes
  const isIdeaPrefix = /^idea:\s*/i.test(text.trim());
  const cleanedText = text
    .replace(/^(voice note[^:]*:\s*|idea:\s*|note:\s*|reminder:\s*)/i, "")
    .trim();

  // 3. Normalize punctuation
  let normalized = cleanedText
    .replace(/\.{2,}/g, " . ")
    .replace(/[!?]+/g, " . ")
    .replace(/;/g, " . ");

  // 4. Insert split markers before conversational intent boundaries
  normalized = normalized.replace(
    /(\s+|^)(i am feeling|i feel|feeling\s+(?:low|down|sad|bad|tired|drained|overwhelmed|stressed)|i am\s+(?:sad|down|low|depressed|unhappy|tired|exhausted|stressed)|i'm\s+(?:sad|down|low|depressed|unhappy|tired|exhausted|stressed)|im\s+(?:sad|down|low|depressed|unhappy|tired|exhausted|stressed)|i had a fight with|i fought with|had a fight with|i had an argument with|argued with|i have to|i need to|i want to|i must|i should|i gotta|i've got to)\b/gi,
    " ---SPLIT--- $2"
  );

  // 5. Insert split markers on conversational transitions & action verbs
  normalized = normalized.replace(
    /\s+(?:and also|and then|plus i|also i|and i|meanwhile|additionally|plus)\s+/gi,
    " ---SPLIT--- "
  );

  // Split on actions like "book movie ticket" if preceded by words without punctuation
  normalized = normalized.replace(
    /(\w+)\s+(book\s+(?:movie|ticket|tickets|flight|hotel|cab|uber|train))\b/gi,
    "$1 ---SPLIT--- $2"
  );

  // 6. Split into individual thought clauses
  const rawSegments = normalized
    .split(/(?:---SPLIT---|[\r\n]+|[.]+|\s*,\s*)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);

  const extractedTasks: ExtractedTask[] = [];

  for (const rawSegment of rawSegments) {
    const sLower = rawSegment.toLowerCase();

    // Skip empty or trivial punctuation fragments
    if (sLower.length < 2) continue;

    // Helper: extract timeframe from segment
    let timeframe = "Today";
    let clausePriority: "CRITICAL" | "HIGH" | "ROUTINE" = "HIGH";

    if (sLower.includes("tomorrow")) {
      timeframe = "Tomorrow";
      clausePriority = "CRITICAL";
    } else if (sLower.includes("tonight")) {
      timeframe = "Tonight";
      clausePriority = "CRITICAL";
    } else if (sLower.includes("this weekend") || sLower.includes("weekend")) {
      timeframe = "This weekend";
      clausePriority = "ROUTINE";
    } else if (sLower.includes("next week")) {
      timeframe = "Next week";
      clausePriority = "HIGH";
    }

    // A. MENTAL LOAD & EMOTIONAL WELLBEING
    const isSadOrLow =
      sLower === "sad" ||
      sLower.includes("i am sad") ||
      sLower.includes("i'm sad") ||
      sLower.includes("im sad") ||
      sLower.includes("feeling sad") ||
      sLower.includes("feeling low") ||
      sLower.includes("feeling down") ||
      sLower.includes("low today") ||
      sLower.includes("depressed") ||
      sLower.includes("exhausted") ||
      sLower.includes("burnt out") ||
      sLower.includes("burned out") ||
      sLower.includes("anxious") ||
      sLower.includes("overwhelmed") ||
      sLower.includes("worried about") ||
      sLower.includes("stressing about") ||
      sLower.includes("stressed") ||
      sLower.includes("crying") ||
      sLower.includes("heartbroken") ||
      sLower.includes("lonely") ||
      sLower.includes("unmotivated") ||
      sLower.includes("mentally tired");

    if (isSadOrLow) {
      let state = "feeling low";
      if (sLower.includes("sad")) state = "feeling sad";
      else if (sLower.includes("burnt out") || sLower.includes("burned out")) state = "burnout";
      else if (sLower.includes("overwhelmed")) state = "feeling overwhelmed";
      else if (sLower.includes("worried about")) state = sLower.replace(/.*worried about\s*/i, "");
      else if (sLower.includes("stressing about")) state = sLower.replace(/.*stressing about\s*/i, "");
      else if (sLower.includes("stressed")) state = "feeling stressed";
      else if (sLower.includes("exhausted")) state = "exhaustion";
      else if (sLower.includes("anxious")) state = "anxiety";

      extractedTasks.push({
        text: `Take space to rest & care for yourself (${state})`,
        type: "IDEA",
        category: "🧠 Wellbeing",
        timeframe: "Today",
        priority: "HIGH",
      });
      continue;
    }

    // B. INTERPERSONAL, RELATIONSHIPS & CONFLICT
    if (
      sLower.includes("fight with") ||
      sLower.includes("argument with") ||
      sLower.includes("argued with") ||
      sLower.includes("upset with") ||
      sLower.includes("misunderstanding with") ||
      sLower.includes("fought with")
    ) {
      const match = rawSegment.match(/(?:fight|argument|argued|upset|misunderstanding|fought)\s+with\s+([a-zA-Z]+)/i);
      const person = match ? capitalize(match[1]) : "them";

      extractedTasks.push({
        text: `Talk to ${person} & resolve conflict`,
        type: "TODO",
        category: "👥 Relationships",
        timeframe: "Today",
        priority: "HIGH",
      });
      continue;
    }

    // C. CODING, DSA, TECH & STUDY
    if (
      /\bdsa\b/i.test(sLower) ||
      sLower.includes("data structures") ||
      sLower.includes("leetcode") ||
      sLower.includes("competitive programming") ||
      sLower.includes("codeforces") ||
      sLower.includes("algorithms")
    ) {
      extractedTasks.push({
        text: "Practice DSA (Data Structures & Algorithms)",
        type: "TODO",
        category: "💻 Coding & Study",
        timeframe: "Today",
        priority: "HIGH",
      });
      continue;
    }

    // D. ACADEMICS, ASSIGNMENTS & FILES
    if (
      (sLower.includes("file") && (sLower.includes("complete") || sLower.includes("finish") || sLower.includes("submit") || sLower.includes("practical") || sLower.includes("lab") || sLower.includes("assignment"))) ||
      sLower.includes("assignment") ||
      sLower.includes("homework") ||
      sLower.includes("practical file") ||
      sLower.includes("lab file") ||
      sLower.includes("submission")
    ) {
      let title = "Complete and submit assignment";
      if (sLower.includes("lab file")) title = "Complete lab file";
      else if (sLower.includes("practical file")) title = "Complete practical file";
      else if (sLower.includes("assignment submission") || (sLower.includes("assignment") && sLower.includes("submission"))) {
        title = "Complete assignment submission";
      } else if (sLower.includes("submit assignment")) {
        title = "Submit assignment";
      } else if (sLower.includes("assignment")) {
        title = "Complete assignment";
      } else if (sLower.includes("complete file") || sLower.includes("finish file")) {
        title = "Complete and submit file";
      }

      extractedTasks.push({
        text: title,
        type: "TODO",
        category: "📚 Academics",
        timeframe,
        priority: timeframe === "Tomorrow" || timeframe === "Tonight" ? "CRITICAL" : "HIGH",
      });
      continue;
    }

    // E. ENTERTAINMENT, MOVIES & TICKETS (Cinema, Concerts, Events)
    const isMovie = sLower.includes("movie") || sLower.includes("cinema") || sLower.includes("theatre") || sLower.includes("theater") || sLower.includes("film");
    const isConcert = sLower.includes("concert") || sLower.includes("gig") || sLower.includes("festival") || sLower.includes("standup") || sLower.includes("comedy show");
    const isEntertainment = isMovie || isConcert || sLower.includes("book show") || sLower.includes("watch movie");

    if (isEntertainment) {
      let title = rawSegment.replace(/^(i need to |i have to |i want to |i gotta |i must |please )/i, "").trim();
      if (isMovie) {
        if (sLower.includes("book") || sLower.includes("ticket")) {
          title = "Book movie ticket";
        } else {
          title = "Watch movie";
        }
      } else if (isConcert) {
        if (sLower.includes("book") || sLower.includes("ticket") || sLower.includes("buy")) {
          title = "Book concert tickets";
        }
      }

      extractedTasks.push({
        text: capitalize(title),
        type: "TODO",
        category: "🎬 Entertainment",
        timeframe,
        priority: "ROUTINE",
      });
      continue;
    }

    // F. TRAVEL & TRANSIT (Flights, Trains, Stays - ONLY when explicitly travel!)
    const isFlight = sLower.includes("flight") || sLower.includes("fly to") || sLower.includes("plane ticket") || sLower.includes("airline");
    const isTrain = sLower.includes("train ticket") || sLower.includes("railway") || sLower.includes("metro ticket") || sLower.includes("bus ticket");
    const isBooking = sLower.includes("hotel") || sLower.includes("airbnb") || sLower.includes("hostel") || sLower.includes("resort") || sLower.includes("cabin");
    const isPacking = sLower.includes("pack clothes") || sLower.includes("pack bag") || sLower.includes("pack suitcase") || sLower.includes("pack for");

    if (isFlight || isTrain || isBooking || isPacking) {
      let category = "✈️ Travel";
      let title = cleanActionTitle(rawSegment);

      if (isFlight) {
        title = sLower.includes("paris") || sLower.includes("ny") || sLower.includes("delhi")
          ? cleanActionTitle(rawSegment)
          : "Book flight";
      } else if (isTrain) {
        title = "Book train ticket";
      } else if (isBooking) {
        title = "Book accommodations";
      } else if (isPacking) {
        title = "Pack essentials & clothes";
      }

      extractedTasks.push({
        text: capitalize(title),
        type: "TODO",
        category,
        timeframe,
        priority: clausePriority,
      });
      continue;
    }

    // G. PEOPLE, CALLS & MESSAGES
    if (
      sLower.includes("heard back from") ||
      sLower.startsWith("call ") ||
      sLower.includes("call ") ||
      sLower.startsWith("text ") ||
      sLower.includes("text ") ||
      sLower.includes("email ") ||
      sLower.includes("send that email")
    ) {
      let taskTitle = cleanActionTitle(rawSegment);
      if (sLower.includes("heard back from")) {
        const personMatch = rawSegment.match(/heard back from\s+([A-Za-z]+)/i);
        const person = personMatch ? personMatch[1] : "collaborator";
        taskTitle = `Follow up with ${capitalize(person)}`;
      } else if (sLower.startsWith("call ") || sLower.includes("call ")) {
        const personMatch = rawSegment.match(/call\s+([A-Za-z]+)/i);
        if (personMatch) taskTitle = `Call ${capitalize(personMatch[1])}`;
      } else if (sLower.startsWith("text ") || sLower.includes("text ")) {
        const personMatch = rawSegment.match(/text\s+([A-Za-z]+)/i);
        if (personMatch) taskTitle = `Text ${capitalize(personMatch[1])}`;
      }

      extractedTasks.push({
        text: capitalize(taskTitle),
        type: "TODO",
        category: "👥 People & Work",
        timeframe,
        priority: timeframe === "Tomorrow" || timeframe === "Tonight" ? "CRITICAL" : "HIGH",
      });
      continue;
    }

    // H. FAMILY & SOCIAL EVENTS
    if (sLower.includes("birthday") || sLower.includes("anniversary") || sLower.includes("party")) {
      extractedTasks.push({
        text: capitalize(cleanActionTitle(rawSegment).replace(/\s+is\s+(next week|tomorrow|soon)/i, "")),
        type: "TODO",
        category: "🏠 Family",
        timeframe: timeframe === "Today" ? "Upcoming" : timeframe,
        priority: "HIGH",
      });
      continue;
    }

    // I. ROUTINES & HABITS
    const isGym = sLower.includes("gym") || sLower.includes("workout");
    const isWakeUp = sLower.includes("wake up") || sLower.includes("waking up") || sLower.includes("sleep at") || sLower.includes("alarm");
    const isDailyHabit = sLower.includes("mon/wed/fri") || sLower.includes("every day") || sLower.includes("daily") || sLower.includes("every morning");

    if (isGym || isWakeUp || isDailyHabit || sLower.includes("routine") || sLower.includes("habit")) {
      let habitTimeframe = "Daily";
      if (sLower.includes("mon/wed/fri") || sLower.includes("mon, wed, fri")) {
        habitTimeframe = "Mon / Wed / Fri";
      } else if (sLower.includes("7 am") || sLower.includes("7:00 am") || sLower.includes("7am")) {
        habitTimeframe = "Daily at 7:00 AM";
      } else if (sLower.includes("morning")) {
        habitTimeframe = "Every morning";
      }

      let taskTitle = cleanActionTitle(rawSegment);
      if (isGym) {
        taskTitle = "Go to the gym / workout";
      } else if (isWakeUp) {
        taskTitle = sLower.includes("7") ? "Wake up at 7:00 AM daily" : "Morning wake-up routine";
      }

      extractedTasks.push({
        text: capitalize(taskTitle),
        type: "ROUTINE",
        category: isGym ? "💪 Fitness" : "⏰ Habit",
        timeframe: habitTimeframe,
        priority: "HIGH",
      });
      continue;
    }

    // J. PROJECTS & CREATIVE WORK
    const isProject =
      sLower.includes("build a") ||
      sLower.includes("building a") ||
      sLower.includes("website") ||
      sLower.includes("portfolio") ||
      sLower.includes("launch") ||
      sLower.includes("develop") ||
      sLower.includes("redesign") ||
      sLower.includes("saas");

    if (isProject) {
      let clean = cleanActionTitle(rawSegment);

      if (/complete this website/i.test(clean)) {
        clean = "Complete website project";
      } else if (/build a website/i.test(clean)) {
        clean = "Build website project";
      } else if (/portfolio/i.test(clean) && !/build/i.test(clean)) {
        clean = "Work on portfolio";
      }

      extractedTasks.push({
        text: capitalize(clean),
        type: "PROJECT",
        category: "💻 Projects",
        timeframe: "This week",
        priority: "HIGH",
      });
      continue;
    }

    // K. PRESENTATION & WORK ERRANDS
    const isPresentation = sLower.includes("presentation") || sLower.includes("slides") || sLower.includes("deck");
    const isGrocery = sLower.includes("buy groceries") || sLower.includes("grocery") || sLower.includes("groceries");

    if (isPresentation) {
      extractedTasks.push({
        text: "Finish presentation & slides",
        type: "TODO",
        category: "💼 Work",
        timeframe,
        priority: clausePriority,
      });
      continue;
    }

    if (isGrocery) {
      extractedTasks.push({
        text: sLower.includes("fruit") || sLower.includes("oat")
          ? "Buy groceries (fruits, oats, water bottles)"
          : "Buy groceries",
        type: "TODO",
        category: "🛒 Errands",
        timeframe,
        priority: clausePriority,
      });
      continue;
    }

    // L. IDEAS & INSPIRATION
    const isIdea = isIdeaPrefix || sLower.includes("idea for") || sLower.includes("idea:") || sLower.includes("new app") || sLower.includes("playlist");
    if (isIdea) {
      let taskTitle = rawSegment;
      if (sLower.includes("idea for a new app") || sLower.includes("idea for an app")) {
        taskTitle = "Idea: Concept for new app";
      } else if (sLower.includes("playlist")) {
        taskTitle = "Create playlist";
      }

      extractedTasks.push({
        text: capitalize(taskTitle.replace(/^(had this |had an |idea:\s*)/i, "")),
        type: "IDEA",
        category: "💡 Idea",
        timeframe: "Someday",
        priority: "ROUTINE",
      });
      continue;
    }

    // M. FALLBACK ACTION (Natural preservation of user's intent)
    const cleaned = cleanActionTitle(rawSegment);
    if (cleaned.length > 0) {
      extractedTasks.push({
        text: capitalize(cleaned),
        type: "TODO",
        category: "📋 Action",
        timeframe,
        priority: clausePriority,
      });
    }
  }

  // If nothing was extracted, fallback to cleaned text
  if (extractedTasks.length === 0) {
    extractedTasks.push({
      text: capitalize(cleanedText.slice(0, 60)),
      type: "TODO",
      category: "📋 Action",
      timeframe: "Today",
      priority: overallPriority,
    });
  }

  const primaryCategory = extractedTasks[0]?.category || "💡 General";

  return {
    category: primaryCategory,
    priority: overallPriority,
    priorityLabel,
    extractedTasks,
  };
}

function cleanActionTitle(segment: string): string {
  return segment
    .replace(/^(i need to |i have to |i want to |i must |i should |i gotta |i've got to |i'm going to |i will |need to |have to |want to |gotta |please |remember to |i am |i'm |im )/i, "")
    .replace(/\s+(tomorrow|today|tonight|this week|asap|urgent)\b/gi, "")
    .trim();
}

function capitalize(str: string): string {
  if (!str) return "";
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Intelligent AI-based task extraction calling the backend /api/gemini route.
 * Automatically falls back to deterministic parsing if offline or on network error.
 */
export async function extractTasksWithAI(text: string): Promise<DetectedMetadata> {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      category: "📋 General",
      priority: "ROUTINE",
      priorityLabel: "🌱 Routine",
      extractedTasks: [],
    };
  }

  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.extractedTasks) && data.extractedTasks.length > 0) {
        return {
          category: data.category || "📋 General",
          priority: data.priority || "ROUTINE",
          priorityLabel: data.priorityLabel || "🌱 Routine",
          extractedTasks: data.extractedTasks.map((t: any) => ({
            text: t.text || "Untitled Task",
            type: t.type || "TODO",
            category: t.category || "📋 General",
            timeframe: t.timeframe || "Today",
            priority: t.priority || "ROUTINE",
          })),
        };
      }
    }
  } catch (err) {
    console.warn("AI extraction call failed, falling back to local extractor:", err);
  }

  // Graceful fallback to heuristic extraction
  return detectThoughtMetadata(trimmed);
}


