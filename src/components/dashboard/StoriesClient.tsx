"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, MessageSquarePlus, PieChart } from "lucide-react";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/lib/api";
import { fetchStories } from "@/lib/api";

export function StoriesClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const storiesData = await fetchStories();
      setData(storiesData);
    } catch (err) {
      console.error(err);
      setError("Failed to load stories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const allStories = data
    ? [...data.latest_stories, ...data.older_stories]
    : [];
  
  const filteredStories = allStories.filter(
    (story) =>
      !search ||
      story.title.toLowerCase().includes(search.toLowerCase()) ||
      story.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ml-[72px] min-h-screen">
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <PieChart className="h-6 w-6 text-corporate-blue" />
              </div>
              All Stories
            </h1>
            <p className="mt-2 text-slate-500">
              Browse and search through all your generated insights.
            </p>
          </div>
          {/* Search */}
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200/60 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-corporate-blue/30 focus:shadow-md"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 p-6 text-center ring-1 ring-red-100 animate-fade-in">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadStories}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && allStories.length === 0 && (
          <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 p-12 text-center ring-1 ring-slate-100 animate-fade-in">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-corporate-blue/10">
              <Sparkles className="h-8 w-8 text-corporate-blue" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              No stories yet
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Start asking questions about your data and your insights will
              appear here as story cards. Each conversation creates a new
              story.
            </p>
            <button
              onClick={() => router.push(`/stories/${crypto.randomUUID()}?q=`)}
              className="inline-flex items-center gap-2 rounded-xl bg-corporate-blue px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-corporate-blue-dark hover:shadow-lg"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Ask your first question
            </button>
          </div>
        )}

        {/* Stories Grid */}
        <section className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
                  <Skeleton className="mb-3 h-5 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-full" />
                  <Skeleton className="mb-3 h-[140px] w-full rounded-lg" />
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredStories.length === 0 && allStories.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No stories match your search.</p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredStories.map((story, i) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    index={i}
                    onDelete={loadStories}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
