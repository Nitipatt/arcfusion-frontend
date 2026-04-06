"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Send, AlertTriangle } from "lucide-react";
import { fetchSuggestions } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/skeleton";

const SUGGESTIONS_CACHE_KEY = "hero_suggestions_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

const DEFAULT_PROMPTS = [
  "Connect to a database to get insights...",
  "What tables do I have?",
  "Show me a summary of my data"
];

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const outOfCredits = user?.credits === 0;

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const cached = localStorage.getItem(SUGGESTIONS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setSuggestions(data);
            setIsLoading(false);
            return;
          }
        }

        const data = await fetchSuggestions();
        if (data && data.length > 0) {
          setSuggestions(data);
          localStorage.setItem(
            SUGGESTIONS_CACHE_KEY,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } else {
          setSuggestions(DEFAULT_PROMPTS);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
        setSuggestions(DEFAULT_PROMPTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const encoded = encodeURIComponent(query.trim());
    router.push(`/stories/${crypto.randomUUID()}?q=${encoded}`);
  };

  const handlePromptClick = (prompt: string) => {
    const encoded = encodeURIComponent(prompt);
    router.push(`/stories/${crypto.randomUUID()}?q=${encoded}`);
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60 transition-all focus-within:shadow-xl focus-within:ring-corporate-blue/30">
          <Search className="ml-5 h-5 w-5 flex-shrink-0 text-slate-400" />
          <input
            id="hero-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={outOfCredits}
            className="flex-1 bg-transparent px-4 py-4 text-[15px] text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || outOfCredits}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-xl bg-corporate-blue text-white transition-all hover:bg-corporate-blue-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {outOfCredits && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-amber-600 bg-amber-50/80 rounded-xl py-2 animate-fade-in border border-amber-100">
          <AlertTriangle className="h-4 w-4" />
          <span>You need more credits to start asking questions.</span>
        </div>
      )}

      {/* Suggested Prompts */}
      <div className="mt-5 flex flex-wrap justify-center gap-2 min-h-[30px]">
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-48 rounded-full bg-slate-200/50" />
            <Skeleton className="h-7 w-64 rounded-full bg-slate-200/50" />
            <Skeleton className="h-7 w-56 rounded-full bg-slate-200/50" />
          </>
        ) : (
          suggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handlePromptClick(prompt)}
              disabled={outOfCredits}
              className="rounded-full bg-white px-3.5 py-1.5 text-xs text-slate-500 shadow-sm ring-1 ring-slate-200/60 transition-all hover:bg-slate-50 hover:text-corporate-blue hover:ring-corporate-blue/20 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {prompt}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
