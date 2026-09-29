"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  formatter?: (val: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  durationMs = 800,
  formatter = (v) => v.toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const change = value - startValue;

    if (change === 0) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + change * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        prevValueRef.current = value;
      }
    };

    window.requestAnimationFrame(step);
  }, [value, durationMs]);

  return (
    <span className={cn("font-mono font-bold tracking-tight", className)}>
      {formatter(displayValue)}
    </span>
  );
}
