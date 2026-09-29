import React from "react";
import { Header } from "@/components/layout/header";
import { DockNav } from "@/components/vengeance/dock-nav";
import { FloatingSupportWidget } from "@/components/features/support/floating-support-widget";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-emerald-500/30">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <DockNav />
      <FloatingSupportWidget />
    </div>
  );
}
