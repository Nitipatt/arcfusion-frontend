import { cookies } from "next/headers";
import type { DatabaseConnection } from "./api";

const API_BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001";

export async function fetchConnectionsServer(): Promise<DatabaseConnection[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/api/connections`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Server API Error fetching connections:", err);
    return [];
  }
}
