/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import type { ChatResponse } from "@/lib/api";

interface ThreadEntry {
  id: string;
  query: string;
  response: ChatResponse | null;
  loading: boolean;
  timestamp: number;
}

interface SessionState {
  sessionId: string;
  threads: ThreadEntry[];
  activeThreadId: string | null;

  setSessionId: (id: string) => void;
  addThread: (query: string) => string;
  setThreadResponse: (id: string, response: ChatResponse) => void;
  setThreadLoading: (id: string, loading: boolean) => void;
  setActiveThread: (id: string | null) => void;
  getActiveThread: () => ThreadEntry | undefined;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: "",
  threads: [],
  activeThreadId: null,

  setSessionId: (id) => set({ sessionId: id }),

  addThread: (query) => {
    const id = `thread-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    set((state) => ({
      threads: [
        ...state.threads,
        { id, query, response: null, loading: true, timestamp: Date.now() },
      ],
      activeThreadId: id,
    }));
    return id;
  },

  setThreadResponse: (id, response) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === id ? { ...t, response, loading: false } : t
      ),
      sessionId: response.session_id || state.sessionId,
    })),

  setThreadLoading: (id, loading) =>
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === id ? { ...t, loading } : t
      ),
    })),

  setActiveThread: (id) => set({ activeThreadId: id }),

  getActiveThread: () => {
    const state = get();
    return state.threads.find((t) => t.id === state.activeThreadId);
  },
}));
