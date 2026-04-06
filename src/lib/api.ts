/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/store/authStore";

function getAuthHeaders(headers: Record<string, string> = {}) {
  const token = useAuthStore.getState().token;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001";

export interface StoryCard {
  id: string;
  title: string;
  description: string;
  echarts_config: Record<string, any>;
  tag: string;
  tag_color: string;
  time_ago: string;
  entity_highlights: string[];
  connection_id?: string;
  created_at: string | null;
}

export interface DashboardData {
  latest_stories: StoryCard[];
  older_stories: StoryCard[];
}

export interface ChatResponse {
  session_id: string;
  user_query: string;
  generated_sql: string;
  insight_title: string;
  narrative_summary: string;
  recommended_actions: string[];
  echarts_config: Record<string, any>;
  raw_data: Record<string, any>[];
  error: string | null;
  follow_ups?: ChatResponse[];
}

export interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  schema: string;
  sslmode: string;
  is_active: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  tables: string[];
}

// ─── Dashboard ───

export async function fetchStories(query?: string): Promise<DashboardData> {
  const url = query
    ? `${API_BASE}/api/dashboard/stories?query=${encodeURIComponent(query)}`
    : `${API_BASE}/api/dashboard/stories`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch stories");
  return res.json();
}

export async function fetchStory(storyId: string): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/dashboard/stories/${storyId}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Story not found");
  return res.json();
}

export async function fetchSuggestions(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/suggestions`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
}

export async function deleteStory(storyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/dashboard/stories/${storyId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete story");
}

// ─── Chat ───

export async function sendQuery(
  query: string,
  sessionId?: string,
  history?: { role: string; content: string }[],
  storyId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      query,
      session_id: sessionId || "",
      history: history || [],
      story_id: storyId || undefined,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to send query");
  }
  return res.json();
}

// ─── Export ───

export async function exportSlides(data: {
  title: string;
  summary: string;
  recommended_actions: string[];
  echarts_config: Record<string, any>;
}): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/export/slides`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to export slides");
  return res.blob();
}

// ─── Connections ───

export async function fetchConnections(): Promise<DatabaseConnection[]> {
  const res = await fetch(`${API_BASE}/api/connections`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch connections");
  return res.json();
}

export async function createConnection(
  conn: Omit<DatabaseConnection, "id" | "is_active">
): Promise<DatabaseConnection> {
  const res = await fetch(`${API_BASE}/api/connections`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(conn),
  });
  if (!res.ok) throw new Error("Failed to create connection");
  return res.json();
}

export async function updateConnection(
  id: string,
  conn: Omit<DatabaseConnection, "id" | "is_active">
): Promise<DatabaseConnection> {
  const res = await fetch(`${API_BASE}/api/connections/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(conn),
  });
  if (!res.ok) throw new Error("Failed to update connection");
  return res.json();
}

export async function deleteConnection(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/connections/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete connection");
}

export async function activateConnection(
  id: string
): Promise<DatabaseConnection> {
  const res = await fetch(`${API_BASE}/api/connections/${id}/activate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to activate connection");
  return res.json();
}

export async function testConnection(
  conn: Omit<DatabaseConnection, "id" | "is_active">
): Promise<ConnectionTestResult> {
  const res = await fetch(`${API_BASE}/api/connections/test`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(conn),
  });
  if (!res.ok) throw new Error("Failed to test connection");
  return res.json();
}

// ─── Auth ───

export async function loginApi(email: string, password: string) {
  const params = new URLSearchParams()
  params.append("username", email)
  params.append("password", password)
  
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function registerApi(name: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Register failed");
  }
  return res.json();
}

export async function getMeApi() {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  return res.json();
}

export async function updateMeApi(data: { name?: string; password?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "PUT",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update profile");
  }
  return res.json();
}

export async function topupCredits(amount: number) {
  const res = await fetch(`${API_BASE}/api/auth/credits/topup?amount=${amount}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add credits");
  }
  return res.json();
}

export async function addRecentShareApi(share: { name: string; email: string; role: string; avatar: string }) {
  const res = await fetch(`${API_BASE}/api/auth/recent-shares`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(share),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add recent share");
  }
  return res.json();
}

export async function shareStoryApi(storyId: string, emails: string[]) {
  const res = await fetch(`${API_BASE}/api/dashboard/stories/${storyId}/share`, {
    method: "POST",
    headers: getAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ emails }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to share story");
  }
  return res.json();
}
