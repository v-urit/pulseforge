import React from "react";
import { cn } from "@/lib/utils";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  children: React.ReactNode;
}

export function BentoCard({
  colSpan = 1,
  rowSpan = 1,
  className,
  children,
  ...props
}: BentoCardProps) {
  const colSpanClasses = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
  };

  const rowSpanClasses = {
    1: "row-span-1",
    2: "row-span-2",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 backdrop-blur-md p-5 flex flex-col justify-between transition-all duration-200 hover:border-border hover:bg-card/80 shadow-sm",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
