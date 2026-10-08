import Constants from "expo-constants";

import { storage } from "@/src/utils/storage";

const configured = Constants.expoConfig?.extra?.backendUrl as string | undefined;
const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const baseUrl = (configured || envUrl || "").replace(/\/$/, "");
export const API_URL = `${baseUrl}/api`;

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("[api] base", API_URL || "(relative /api)");
}

export type User = { id: string; name: string; email: string; avatar?: string; level: number; level_name: string; xp: number; streak: number; experience: string };
export type Language = { id: string; name: string; icon: string; color: string; level: string; description: string; progress: number; lessons_count: number; syntax_count: number };
export type Lesson = { id: string; language_id: string; order: number; title: string; summary: string; xp: number; duration: string; progress?: number };
export type LessonContent = { title: string; body: string };
export type SyntaxItem = { id: string; name: string; category: string; description: string; syntax: string; example: string; output: string; mistakes: string[]; language_id: string };
export type Challenge = { id: string; language_id: string; title: string; description: string; starter: string; expected: string; xp: number; difficulty: string };
export type Badge = { id: string; title: string; description: string; unlocked: boolean };
export type Dashboard = { user: User; active_lesson: Lesson; language_progress: Record<string, number>; completed_lessons: number; syntax_learned: number; quiz_completed: number; challenge_completed: number; badges: Badge[]; bookmarks: { content_id: string; title: string; content_type: string }[]; notes: { id: string; note: string; content_id: string }[]; history: { content_id: string; title: string; content_type: string }[]; recommendation: string; daily_syntax: SyntaxItem | null; daily_challenge: Challenge | null };

async function request<T>(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<T> {
  const token = await storage.secureGet("syntaxai_token", null);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || "Koneksi sedang bermasalah. Silakan coba lagi.");
    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error("Koneksi lambat. Periksa internet lalu coba lagi.");
    if (error instanceof TypeError) throw new Error("Tidak dapat menghubungi server. Coba lagi sebentar.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  register: (body: { name: string; email: string; password: string; experience: string }) => request<{ token: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request<User>("/auth/me"),
  catalog: () => request<{ languages: Language[]; lessons: Lesson[]; syntax: SyntaxItem[] }>("/catalog"),
  dashboard: () => request<Dashboard>("/dashboard"),
  lesson: (id: string) => request<{ lesson: Lesson; progress: number; sections: LessonContent[]; syntax: SyntaxItem[]; quiz_id: string; challenge: Challenge | null }>(`/lessons/${id}`),
  syntax: (q = "", language = "") => request<{ items: SyntaxItem[]; count: number }>(`/syntax?q=${encodeURIComponent(q)}&language=${language}`),
  syntaxDetail: (id: string) => request<SyntaxItem>(`/syntax/${id}`),
  quiz: (id: string) => request<{ id: string; title: string; questions: { id: string; question: string; options: string[]; answer: number; explanation: string }[] }>(`/quizzes/${id}`),
  challenges: (language = "") => request<{ items: Challenge[] }>(`/challenges?language=${language}`),
  challenge: (id: string) => request<Challenge>(`/challenges/${id}`),
  tutorMessage: (body: { message: string; conversation_id?: string }) => request<{ conversation_id: string; reply: string; updated_at: string }>("/tutor/message", { method: "POST", body: JSON.stringify(body) }, 45000),
  tutorConversations: () => request<{ items: { id: string; title: string; created_at: string; updated_at: string }[] }>("/tutor/conversations"),
  tutorConversation: (id: string) => request<{ id: string; title: string; messages: { role: "user" | "assistant"; content: string; at: string }[]; updated_at: string }>(`/tutor/conversations/${id}`),
  tutorDelete: (id: string) => request<{ message: string }>(`/tutor/conversations/${id}`, { method: "DELETE" }),
  leaderboard: (scope: "all" | "week" = "all") => request<{ scope: string; entries: { rank: number; user_id: string; name: string; xp: number; level: number; level_name: string; streak: number; is_me: boolean }[]; my_rank: number | null; total: number }>(`/leaderboard?scope=${scope}`),
  progress: (body: { item_id: string; item_type: string; percentage: number; xp: number }) => request<{ message: string }>("/progress", { method: "POST", body: JSON.stringify(body) }),
  quizResult: (body: { quiz_id: string; score: number; correct_answers: number; wrong_answers: number }) => request<{ xp_earned: number }>("/quiz-results", { method: "POST", body: JSON.stringify(body) }),
  runCode: (body: { language: string; code: string }) => request<{ output: string; error: string | null; hint: string }>("/run-code", { method: "POST", body: JSON.stringify(body) }),
  submitChallenge: (body: { challenge_id: string; code: string }) => request<{ passed: boolean; output: string; expected: string; xp_earned: number; feedback: string }>("/challenges/submit", { method: "POST", body: JSON.stringify(body) }),
  bookmarks: () => request<{ content_id: string; title: string; content_type: string }[]>("/bookmarks"),
  bookmark: (body: { content_type: string; content_id: string; title: string }) => request<{ saved: boolean }>("/bookmarks", { method: "POST", body: JSON.stringify(body) }),
  notes: () => request<{ id: string; note: string; content_id: string; content_type: string }[]>("/notes"),
  note: (body: { content_type: string; content_id: string; note: string }) => request<{ id: string }>("/notes", { method: "POST", body: JSON.stringify(body) }),
  history: (body: { content_type: string; content_id: string; title: string }) => request<{ message: string }>("/history", { method: "POST", body: JSON.stringify(body) }),
  profile: (body: { name?: string; experience?: string }) => request<User>("/profile", { method: "PATCH", body: JSON.stringify(body) }),
  deleteAccount: () => request<{ message: string }>("/account", { method: "DELETE" }),
};
