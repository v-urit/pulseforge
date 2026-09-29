"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Headset, Shield, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface DockItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const defaultItems: DockItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Monitoring", href: "/monitoring", icon: <Activity className="h-4 w-4" /> },
  { label: "War Room", href: "/incidents", icon: <AlertTriangle className="h-4 w-4" /> },
  { label: "Live Support", href: "/support", icon: <Headset className="h-4 w-4" /> },
  { label: "Admin Console", href: "/admin", icon: <Shield className="h-4 w-4" /> },
];

export function DockNav({ items = defaultItems }: { items?: DockItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/70 px-3 py-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
