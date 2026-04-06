import React from "react";

interface MockChartProps {
  option?: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
}

const MockReactECharts = ({ option, style, className }: MockChartProps) => (
  <div data-testid="echarts-mock" style={style} className={className}>
    {JSON.stringify(option)}
  </div>
);

export default MockReactECharts;
