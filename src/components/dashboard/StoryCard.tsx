"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Trash2, Bookmark, BookmarkCheck } from "lucide-react";
import { DynamicChart } from "@/components/charts/DynamicChart";
import type { StoryCard as StoryCardType } from "@/lib/api";
import { deleteStory } from "@/lib/api";
import { useState } from "react";
import { useBookmarks } from "@/hooks/useBookmarks";

interface StoryCardProps {
  story: StoryCardType;
  index: number;
  onDelete?: () => void;
}



const TAG_COLORS: Record<string, string> = {
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  orange: "bg-amber-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

function highlightEntities(title: string, entities: string[]) {
  if (!entities.length) return title;
  let result = title;
  entities.forEach((entity) => {
    result = result.replace(
      new RegExp(`(${entity})`, "gi"),
      `<span class="text-corporate-blue font-semibold">$1</span>`
    );
  });
  return result;
}

function computeTimeAgo(createdAt: string | null, fallback: string): string {
  if (fallback) return fallback;
  if (!createdAt) return "";

  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return mins === 1 ? "1 min ago" : `${mins} mins ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (diffSec < 604800) {
    const days = Math.floor(diffSec / 86400);
    return days === 1 ? "Yesterday" : `${days} days ago`;
  }
  if (diffSec < 2592000) {
    const weeks = Math.floor(diffSec / 604800);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  const months = Math.floor(diffSec / 2592000);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

import { useConfirm } from "@/hooks/useConfirm";

function transformForMiniCard(originalConfig: Record<string, any>) {
  // Deep clone to avoid mutating the original object
  const config = JSON.parse(JSON.stringify(originalConfig));

  // Remove title, legend, toolbox, dataZoom for mini view
  delete config.title;
  delete config.legend;
  delete config.toolbox;
  delete config.dataZoom;

  // Optimize grid for small space
  config.grid = {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
    containLabel: false, // We hide labels, so no need to contain them
  };

  // Turn off tooltips for mini view to avoid annoying popups on hover
  if (config.tooltip) {
    config.tooltip.show = false;
  }

  // Optimize axes for readability
  if (Array.isArray(config.xAxis)) {
    config.xAxis.forEach((axis: any) => {
      axis.name = ""; // Remove axis names
      axis.axisLabel = { show: false };
      axis.axisTick = { show: false };
      axis.axisLine = { show: false };
      axis.splitLine = { show: false };
    });
  } else if (config.xAxis) {
     config.xAxis.name = "";
     config.xAxis.axisLabel = { show: false };
     config.xAxis.axisTick = { show: false };
     config.xAxis.axisLine = { show: false };
     config.xAxis.splitLine = { show: false };
  }

  if (Array.isArray(config.yAxis)) {
    config.yAxis.forEach((axis: any) => {
      axis.name = "";
      axis.axisLabel = { show: false };
      axis.axisTick = { show: false };
      axis.axisLine = { show: false };
      axis.splitLine = { show: false };
    });
  } else if (config.yAxis) {
     config.yAxis.name = "";
     config.yAxis.axisLabel = { show: false };
     config.yAxis.axisTick = { show: false };
     config.yAxis.axisLine = { show: false };
     config.yAxis.splitLine = { show: false };
  }
  
  // Clean up series labels (e.g. pie chart labels)
  if (Array.isArray(config.series)) {
    config.series.forEach((series: any) => {
      if (series.type === 'pie' || series.type === 'donut') {
        series.label = { show: false };
        series.labelLine = { show: false };
        // Center pie chart properly
        series.center = ['50%', '50%'];
      }
      if (series.type === 'bar' || series.type === 'line') {
         // Optionally remove series labels if they clutter
         if (series.label) series.label.show = false;
         // Make line charts look smoother in mini view
         if (series.type === 'line') {
           series.showSymbol = false;
           series.lineStyle = series.lineStyle || {};
           series.lineStyle.width = 2;
         }
      }
    });
  }

  return config;
}

export function StoryCard({ story, index, onDelete }: StoryCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { confirm } = useConfirm();

  const bookmarked = isBookmarked(story.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = await confirm({
      title: "Delete Story",
      description: "Are you sure you want to delete this story? This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Delete",
    });
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      await deleteStory(story.id);
      onDelete?.();
    } catch (err) {
      console.error("Failed to delete story:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark(story);
  };

  const timeAgo = computeTimeAgo(story.created_at, story.time_ago);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() =>
        router.push(`/stories/${story.id}?q=${encodeURIComponent(story.title)}`)
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          router.push(`/stories/${story.id}?q=${encodeURIComponent(story.title)}`);
        }
      }}
      className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:shadow-lg hover:ring-slate-200 hover:-translate-y-0.5 text-left animate-slide-up cursor-pointer"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
    >
      {/* Top right actions */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-10">
        <span
          role="button"
          tabIndex={0}
          onClick={handleBookmark}
          onKeyDown={(e) => { if (e.key === 'Enter') handleBookmark(e as unknown as React.MouseEvent); }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 text-slate-400 hover:text-corporate-blue ${
            bookmarked ? "text-corporate-blue opacity-100" : ""
          }`}
          title={bookmarked ? "Remove bookmark" : "Bookmark story"}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={handleDelete}
          onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(e as unknown as React.MouseEvent); }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500 ${
            deleting ? "opacity-100 animate-pulse" : ""
          }`}
          title="Delete story"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[15px] font-semibold leading-snug text-slate-800 mb-2 pr-12"
        dangerouslySetInnerHTML={{
          __html: highlightEntities(story.title, story.entity_highlights),
        }}
      />
      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
        {story.description}
      </p>

      {/* Mini Chart */}
      {story.echarts_config && Object.keys(story.echarts_config).length > 0 && (
        <div className="flex-1 min-h-[140px] mb-3">
          <DynamicChart option={transformForMiniCard(story.echarts_config)} height={140} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${TAG_COLORS[story.tag_color] || "bg-slate-400"}`}
          >
            {story.tag}
          </span>
          <span className="text-[11px] text-slate-400">{timeAgo}</span>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:text-corporate-blue group-hover:translate-x-0.5" />
      </div>
    </div>
  );
}

interface OlderStoryCardProps {
  story: StoryCardType;
  index: number;
}

export function OlderStoryCard({ story, index }: OlderStoryCardProps) {
  const router = useRouter();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const bookmarked = isBookmarked(story.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark(story);
  };

  const timeAgo = computeTimeAgo(story.created_at, story.time_ago);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() =>
        router.push(`/stories/${story.id}?q=${encodeURIComponent(story.title)}`)
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          router.push(`/stories/${story.id}?q=${encodeURIComponent(story.title)}`);
        }
      }}
      className="group relative flex h-full min-w-[260px] flex-col justify-between rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-5 ring-1 ring-blue-100/60 transition-all duration-300 hover:shadow-md hover:from-blue-100/80 hover:to-sky-100/80 text-left animate-slide-up cursor-pointer"
      style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: "backwards" }}
    >
      {/* Top right actions */}
      <div className="absolute top-3 right-3 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-10">
        <span
          role="button"
          tabIndex={0}
          onClick={handleBookmark}
          onKeyDown={(e) => { if (e.key === 'Enter') handleBookmark(e as unknown as React.MouseEvent); }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/50 text-blue-400 hover:text-corporate-blue ${
            bookmarked ? "text-corporate-blue opacity-100" : ""
          }`}
          title={bookmarked ? "Remove bookmark" : "Bookmark story"}
        >
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 leading-snug mb-2 pr-8 line-clamp-2">
          {story.title}
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
          {story.description}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        {timeAgo && (
          <span className="text-[10px] text-slate-400">{timeAgo}</span>
        )}
        <ArrowRight className="h-4 w-4 text-blue-300 transition-all group-hover:text-corporate-blue group-hover:translate-x-0.5 ml-auto" />
      </div>
    </div>
  );
}
