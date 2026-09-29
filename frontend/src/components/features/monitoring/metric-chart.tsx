"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface MetricChartProps {
  title: string;
  metric: string;
  currentValue: string;
  unit?: string;
  data: number[];
  color?: "emerald" | "cyan" | "amber" | "rose" | "violet";
  className?: string;
}

export function MetricChart({
  title,
  metric,
  currentValue,
  unit = "",
  data,
  color = "emerald",
  className,
}: MetricChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const colorMap = {
    emerald: {
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.15)",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    },
    cyan: {
      stroke: "#06b6d4",
      fill: "rgba(6, 182, 212, 0.15)",
      border: "border-cyan-500/30",
      text: "text-cyan-400",
      glow: "shadow-[0_0_12px_rgba(6,182,212,0.15)]",
    },
    amber: {
      stroke: "#f59e0b",
      fill: "rgba(245, 158, 11, 0.15)",
      border: "border-amber-500/30",
      text: "text-amber-400",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.15)]",
    },
    rose: {
      stroke: "#f43f5e",
      fill: "rgba(244, 63, 94, 0.15)",
      border: "border-rose-500/30",
      text: "text-rose-400",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.15)]",
    },
    violet: {
      stroke: "#8b5cf6",
      fill: "rgba(139, 92, 246, 0.15)",
      border: "border-violet-500/30",
      text: "text-violet-400",
      glow: "shadow-[0_0_12px_rgba(139,92,246,0.15)]",
    },
  };

  const scheme = colorMap[color];
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  // Build SVG path
  const width = 360;
  const height = 90;
  const stepX = width / (data.length - 1);

  const points = data.map((val, idx) => {
    const x = idx * stepX;
    const y = height - ((val - min) / range) * (height - 16) - 8;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/70 p-4 backdrop-blur-md transition-all duration-200 hover:border-border",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {metric}
          </span>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        <div className="text-right">
          <div className={cn("text-lg font-bold font-mono", scheme.text)}>
            {hoverIndex !== null ? `${data[hoverIndex]}${unit}` : currentValue}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {hoverIndex !== null ? `T-${(data.length - 1 - hoverIndex) * 10}s` : "Live telemetry"}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-background/50 border border-border/30 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-24 overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={scheme.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={scheme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke="currentColor" strokeOpacity="0.08" />
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="currentColor" strokeOpacity="0.08" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="currentColor" strokeOpacity="0.08" />

          {/* Shaded Area */}
          <path d={areaD} fill={`url(#grad-${color})`} />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={scheme.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive dots */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === idx ? 4 : 2}
              fill={scheme.stroke}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
