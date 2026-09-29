"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusTileProps {
  label: string;
  value: React.ReactNode;
  subtext?: string;
  status?: "operational" | "degraded" | "outage" | "info";
  icon?: React.ReactNode;
  className?: string;
}

export function StatusTile({
  label,
  value,
  subtext,
  status = "operational",
  icon,
  className,
}: StatusTileProps) {
  const statusConfig = {
    operational: {
      dot: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
      badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      ping: "bg-emerald-400",
    },
    degraded: {
      dot: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
      badge: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      ping: "bg-amber-400",
    },
    outage: {
      dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]",
      badge: "border-rose-500/30 text-rose-400 bg-rose-500/10",
      ping: "bg-rose-400",
    },
    info: {
      dot: "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
      badge: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
      ping: "bg-cyan-400",
    },
  };

  const current = statusConfig[status];

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/50 bg-card/70 p-4 backdrop-blur-md transition-all duration-200 hover:border-border hover:bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {icon}
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                current.ping
              )}
            />
            <span
              className={cn(
                "relative inline-flex h-2 w-2 rounded-full",
                current.dot
              )}
            />
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
        {subtext && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
        )}
      </div>
    </div>
  );
}
