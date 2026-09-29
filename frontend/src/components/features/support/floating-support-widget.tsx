"use client";

import React, { useState } from "react";
import { Headset, X } from "lucide-react";
import { SupportChatPanel } from "@/components/features/support/support-chat-panel";

export function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[380px] sm:w-[420px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -top-3 -right-2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-foreground shadow-lg cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <SupportChatPanel initialAgentOnline={true} />
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-card/90 px-4 py-2.5 text-xs font-semibold text-foreground shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500 hover:bg-card cursor-pointer"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <Headset className="h-4 w-4 text-emerald-400" />
          <span>Talk to us</span>
        </button>
      )}
    </div>
  );
}
