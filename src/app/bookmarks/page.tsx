"use client";

import Link from "next/link";
import { Bookmark, Sparkles, Home } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { StoryCard } from "@/components/dashboard/StoryCard";
import { useState, useEffect } from "react";

export default function BookmarksPage() {
  const { bookmarks } = useBookmarks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="ml-[72px] min-h-screen">
      <div className="mx-auto max-w-6xl px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Bookmark className="h-6 w-6 text-purple-600" />
              </div>
              Bookmarks
            </h1>
            <p className="mt-2 text-slate-500">
              Your saved insights, threads, and important reports.
            </p>
          </div>
        </div>

        {/* Content */}
        {!mounted ? null : bookmarks.length === 0 ? (
          <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50 p-16 text-center ring-1 ring-slate-100 animate-fade-in shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100/50 ring-1 ring-purple-200 shadow-inner">
              <Bookmark className="h-10 w-10 text-purple-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-3">
              No bookmarks yet
            </h2>
            <p className="text-base text-slate-600 max-w-md mx-auto mb-8">
              You haven&apos;t bookmarked anything yet. When you find an insight or thread you want to keep handy, click the bookmark icon to save it here.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-purple-700 hover:shadow-lg"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Link>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:shadow"
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                Explore Stories
              </Link>
            </div>
          </div>
        ) : (
          <section className="mb-12 animate-fade-in">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bookmarks.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
