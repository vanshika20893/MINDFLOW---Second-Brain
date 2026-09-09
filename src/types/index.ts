import type { ExtractedTask } from "@/lib/ai-detector";

export type NavPage = "dump" | "plan" | "connections" | "insights";

export interface DumpItem {
  id: string;
  rawText: string;
  category: string;
  priority: "CRITICAL" | "HIGH" | "ROUTINE";
  isAudio: boolean;
  createdAt: string;
  status: "SYNCED" | "EXTRACTING" | "EMBEDDED";
  extractedTasks: (string | ExtractedTask)[];
}

export interface TaskItem {
  id: string;
  title: string;
  sourceDumpTitle: string;
  type?: "TODO" | "ROUTINE" | "PROJECT" | "IDEA";
  priority: "CRITICAL" | "HIGH" | "ROUTINE";
  timeframe?: string;
  dueDate: string;
  completed: boolean;
  tags: string[];
}
