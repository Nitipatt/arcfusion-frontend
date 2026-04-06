"use client";

import { useState, useEffect } from "react";
import type { StoryCard as StoryCardType } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<StoryCardType[]>([]);
  const user = useAuthStore((state) => state.user);
  const storageKey = user ? `story_bookmarks_${user.id}` : "story_bookmarks";

  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setBookmarks(JSON.parse(saved));
        } else {
          setBookmarks([]);
        }
      } catch (err) {
        console.error("Failed to load bookmarks", err);
      }
    };

    loadBookmarks();

    window.addEventListener("bookmarksUpdated", loadBookmarks);
    return () => window.removeEventListener("bookmarksUpdated", loadBookmarks);
  }, [storageKey]);

  const isBookmarked = (storyId: string) => {
    return bookmarks.some((b) => b.id === storyId);
  };

  const toggleBookmark = (story: StoryCardType) => {
    try {
      const saved = localStorage.getItem(storageKey);
      const currentBookmarks = saved ? JSON.parse(saved) : [];
      
      let newBookmarks;
      if (currentBookmarks.some((b: StoryCardType) => b.id === story.id)) {
        newBookmarks = currentBookmarks.filter((b: StoryCardType) => b.id !== story.id);
      } else {
        newBookmarks = [story, ...currentBookmarks];
      }
      
      localStorage.setItem(storageKey, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("bookmarksUpdated"));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  return { bookmarks, isBookmarked, toggleBookmark, setBookmarks };
}
