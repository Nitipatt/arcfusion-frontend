"use client";

import dynamic from "next/dynamic";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-chart-cyan border-t-transparent" />
    </div>
  ),
});

interface DynamicChartProps {
  option: Record<string, unknown>;
  height?: string | number;
  className?: string;
}

export function DynamicChart({
  option,
  height = 300,
  className = "",
}: DynamicChartProps) {
  if (!option || Object.keys(option).length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-sm" style={{ height }}>
        No chart data available
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      className={className}
      opts={{ renderer: "canvas" }}
      notMerge
      lazyUpdate
    />
  );
}
