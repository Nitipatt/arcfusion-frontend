"use client";

import { useState } from "react";
import { Lock, Info } from "lucide-react";
import { DynamicChart } from "@/components/charts/DynamicChart";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatResponse } from "@/lib/api";

interface InsightCardProps {
  data: ChatResponse | null;
  loading: boolean;
  onActionClick?: (action: string) => void;
  outOfCredits?: boolean;
}

export function InsightCard({ data, loading, onActionClick, outOfCredits = false }: InsightCardProps) {
  const [actionClicked, setActionClicked] = useState(false);

  const handleActionClick = (action: string) => {
    if (actionClicked || !onActionClick) return;
    setActionClicked(true);
    onActionClick(action);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 animate-pulse-subtle">
        <Skeleton className="mb-6 h-8 w-3/4" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-[160px] w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="mt-6 h-[280px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  if (data.insight_title === "Off-topic Request") {
    // Extract the reason from the markdown formatted text to style it separately
    const reasonMatch = data.narrative_summary.match(/\*\*Reason:\*\* (.*?)(\n|$)/);
    const reasonText = reasonMatch ? reasonMatch[1] : null;

    return (
      <div className="flex items-start gap-4 rounded-2xl bg-amber-50/80 p-5 ring-1 ring-amber-200/60 animate-fade-in my-2">
        <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-600 shrink-0">
          <Info className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-semibold text-amber-800 mb-1.5">{data.insight_title}</h3>
          <p className="text-[14px] text-amber-700/80 leading-relaxed max-w-3xl">
            I am a data analytics assistant built to query your schema. I cannot help with that request.
            {reasonText && (
              <span className="block mt-2 font-medium text-amber-800/90 text-[13px] bg-amber-100/50 p-2.5 rounded-lg">
                <span className="font-bold mr-1">Reason:</span>
                {reasonText}
              </span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100 animate-fade-in">
      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-800 mb-6 leading-tight">
        {data.insight_title || data.user_query}
      </h1>

      {/* 2-Column: Summary + Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 mb-8">
        {/* Narrative Summary */}
        <div className="lg:col-span-3">
          <p className="text-[15px] leading-relaxed text-slate-600">
            {data.narrative_summary}
          </p>
          {data.generated_sql && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 transition-colors">
                View generated SQL
              </summary>
              <pre className="mt-2 rounded-lg bg-slate-900 p-3 text-xs text-emerald-300 overflow-x-auto">
                {data.generated_sql}
              </pre>
            </details>
          )}
        </div>

        {/* Recommended Actions */}
        {data.recommended_actions.length > 0 && (
          <div className="lg:col-span-2">
            <div className={`rounded-xl p-5 ring-1 transition-all ${outOfCredits ? 'bg-slate-100/60 ring-slate-200/50 opacity-60' : 'bg-slate-50 ring-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">
                  Recommended Actions
                </h3>
                {outOfCredits && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 ring-1 ring-amber-100">
                    <Lock className="h-2.5 w-2.5" />
                    No credits
                  </span>
                )}
              </div>
              <div className="flex flex-col space-y-2.5">
                {data.recommended_actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleActionClick(action)}
                    disabled={!onActionClick || actionClicked || outOfCredits}
                    className={`flex text-left items-start gap-2.5 text-sm transition-all group p-2.5 rounded-xl ring-1 ring-transparent focus:outline-none disabled:cursor-not-allowed ${
                      outOfCredits
                        ? 'text-slate-400 grayscale'
                        : 'text-slate-600 hover:bg-white hover:shadow-sm hover:ring-slate-200/60 focus:ring-corporate-blue/30 disabled:opacity-50 disabled:grayscale'
                    }`}
                    title={outOfCredits ? 'Purchase more credits to use recommended actions' : ''}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                      outOfCredits
                        ? 'bg-slate-200/50 text-slate-400'
                        : 'bg-chart-cyan/15 text-teal-700 group-hover:bg-chart-cyan/25 group-hover:text-corporate-blue'
                    }`}>
                      {i + 1}
                    </span>
                    <span className={`leading-relaxed ${outOfCredits ? '' : 'group-hover:text-slate-800'}`}>{action}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {data.echarts_config && Object.keys(data.echarts_config).length > 0 && (
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <DynamicChart option={data.echarts_config} height={350} />
        </div>
      )}

      {/* Error */}
      {data.error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
          <strong>Error:</strong> {data.error}
        </div>
      )}
    </div>
  );
}
