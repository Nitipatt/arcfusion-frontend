"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Clock, Share2, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InsightCard } from "@/components/thread/InsightCard";
import { FollowUpInput } from "@/components/thread/FollowUpInput";
import { ShareModal } from "@/components/thread/ShareModal";
import { useAuthStore } from "@/store/authStore";
import type { ChatResponse } from "@/lib/api";
import { sendQuery, fetchStory, deleteStory } from "@/lib/api";
import { useConfirm } from "@/hooks/useConfirm";

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const router = useRouter();
  const { confirm } = useConfirm();
  const [deleting, setDeleting] = useState(false);

  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const hasExecutedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { decrementCredit, user } = useAuthStore();

  const executeQuery = useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const history = responses.flatMap(r => [
          { role: "user", content: r.user_query },
          { role: "assistant", content: r.narrative_summary || r.error || "No insight generated." }
        ]);
        
        const isInitial = history.length === 0;
        sendQuery(query, sessionId, history, isInitial ? threadId : undefined).then((result) => {
           setResponses((current) => [...current, result]);
           if (result.session_id) setSessionId(result.session_id);
           decrementCredit();
           setLoading(false);
        }).catch(err => {
             console.error("Query failed:", err);
             setResponses((current) => [
               ...current,
               {
                 session_id: sessionId,
                 user_query: query,
                 generated_sql: "",
                 insight_title: "Error",
                 narrative_summary:
                   "Failed to process your query. Please ensure the backend and LangGraph services are running.",
                 recommended_actions: [],
                 echarts_config: {},
                 raw_data: [],
                 error: String(err),
               },
             ]);
             setLoading(false);
          });
      } catch (err) {
        console.error("Failed to initiate executeQuery:", err);
        setLoading(false);
      }
    },
    [sessionId, decrementCredit, threadId, responses]
  );

  useEffect(() => {
    if (hasExecutedRef.current) return;
    hasExecutedRef.current = true;

    const isNewThread = threadId === "new";

    if (!isNewThread) {
      // Existing story — load from DB instantly
      setLoading(true);
      fetchStory(threadId)
        .then((story) => {
          setResponses([story, ...(story.follow_ups || [])]);
          if (story.session_id) setSessionId(story.session_id);
          setLoading(false);
        })
        .catch(() => {
          // Story not found in DB — fall back to executing the query
          if (initialQuery) {
            executeQuery(decodeURIComponent(initialQuery));
            // executeQuery manages its own loading state implicitly
          } else {
            setLoading(false);
          }
        });
    } else if (initialQuery) {
      // Legacy "new" path fallback
      executeQuery(decodeURIComponent(initialQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFollowUp = (query: string) => {
    executeQuery(query);
  };

  useEffect(() => {
    // Smooth scroll to bottom when a new follow-up is added, or when loading skeleton appears
    // setTimeout ensures the DOM has painted the new UI elements first before scrolling
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [responses.length, loading]);

  const latestResponse = responses[responses.length - 1] || null;

  return (
    <div className="ml-[72px] min-h-screen pb-24">
      <div className="mx-auto max-w-4xl px-8 py-8">
        {/* Top Bar */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className="rounded-full bg-chart-cyan/15 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-chart-cyan/25">
              Your Thread
            </Badge>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Now
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="share-button"
              onClick={() => setShareOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              id="bookmark-button"
              onClick={() => setBookmarked(!bookmarked)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                bookmarked
                  ? "bg-amber-50 text-amber-500"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title="Bookmark"
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
            <button
              id="delete-story-button"
              disabled={deleting}
              onClick={async () => {
                const confirmed = await confirm({
                  title: "Delete Story",
                  description: "Are you sure you want to delete this story and all its follow-ups? This action cannot be undone.",
                  variant: "danger",
                  confirmLabel: "Delete",
                });
                if (!confirmed) return;
                setDeleting(true);
                try {
                  await deleteStory(threadId);
                  router.push("/");
                } catch (err) {
                  console.error("Failed to delete story:", err);
                  setDeleting(false);
                }
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                deleting
                  ? "text-red-400 animate-pulse"
                  : "text-slate-400 hover:bg-red-50 hover:text-red-500"
              }`}
              title="Delete story"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-6">
          {responses.map((response, i) => (
            <div key={i}>
              {i > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm ring-1 ring-slate-100">
                    Follow-up
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <InsightCard 
                data={response} 
                loading={false} 
                onActionClick={handleFollowUp}
                outOfCredits={user?.credits === 0}
              />
            </div>
          ))}
          {loading && <InsightCard data={null} loading={true} />}
          <div ref={bottomRef} className="h-1 content-none" />
        </div>
      </div>

      {/* Follow-up Input */}
      {user?.credits === 0 && (
        <div className="fixed bottom-[88px] left-[72px] right-0 z-50 mx-auto max-w-3xl animate-fade-in text-center px-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm text-amber-700 shadow-sm">
            You&apos;ve run out of credits. Please purchase more to continue asking questions.
          </div>
        </div>
      )}
      <FollowUpInput onSubmit={handleFollowUp} disabled={loading || user?.credits === 0} />

      {/* Share Modal */}
      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        data={latestResponse}
        storyId={threadId}
      />
    </div>
  );
}
