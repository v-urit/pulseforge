"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlowBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "emerald" | "rose" | "cyan" | "amber" | "violet";
  children: React.ReactNode;
}

export function GlowBorder({
  glowColor = "emerald",
  className,
  children,
  ...props
}: GlowBorderProps) {
  const glowClasses = {
    emerald: "before:from-emerald-500/20 before:to-emerald-500/0 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    rose: "before:from-rose-500/25 before:to-rose-500/0 hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    cyan: "before:from-cyan-500/20 before:to-cyan-500/0 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]",
    amber: "before:from-amber-500/20 before:to-amber-500/0 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]",
    violet: "before:from-violet-500/20 before:to-violet-500/0 hover:border-violet-500/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]",
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-card/80 backdrop-blur-md transition-all duration-300",
        glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
