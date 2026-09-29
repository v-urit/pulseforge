"use client";

import React, { useState } from "react";
import { Send, Headset, CheckCheck, Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ChatMessage {
  id: string;
  sender: "customer" | "agent" | "system";
  text: string;
  timestamp: string;
}

interface SupportChatPanelProps {
  initialAgentOnline?: boolean;
}

export function SupportChatPanel({ initialAgentOnline = true }: SupportChatPanelProps) {
  const [isAgentOnline, setIsAgentOnline] = useState(initialAgentOnline);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "system",
      text: "Welcome to PulseForge Live Support. Connected via ticket-authenticated WebSocket.",
      timestamp: "10:00 AM",
    },
    {
      id: "msg-2",
      sender: "agent",
      text: "Hi there! I'm Sarah from the Infrastructure Support Team. How can I help you today?",
      timestamp: "10:01 AM",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "customer",
      text: inputText,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate agent reply or offline email fallback
    setTimeout(() => {
      if (isAgentOnline) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-agent-${Date.now()}`,
            sender: "agent",
            text: "Got it! Looking into your tenant's ingestion metrics and Redis buffer status right now.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-sys-${Date.now()}`,
            sender: "system",
            text: "Support agents are currently offline. We have dispatched your inquiry to the worker email queue (notifications@pulseforge.local) and sent a confirmation to your email. Expect a response in ~15 mins.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[520px] rounded-xl border border-border/70 bg-card/90 backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Support Chat Header */}
      <div className="p-4 border-b border-border/50 bg-background/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 border border-border text-foreground">
              <Headset className="h-4 w-4 text-emerald-400" />
            </div>
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${
                isAgentOnline ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
              }`}
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">PulseForge Support</h3>
            <p className="text-[11px] text-muted-foreground">
              {isAgentOnline ? "Sarah (Support Engineer) is Online" : "Agents Offline — Email Fallback Active"}
            </p>
          </div>
        </div>

        {/* Toggle online/offline to simulate fallback */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 border-border/60"
          onClick={() => setIsAgentOnline(!isAgentOnline)}
        >
          {isAgentOnline ? "Simulate Offline" : "Simulate Online"}
        </Button>
      </div>

      {/* Status Notice Banner */}
      {!isAgentOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-300">
          <Mail className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Offline mode: messages degrade gracefully and route to our 24/7 on-call queue.</span>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            return (
              <div key={msg.id} className="text-center my-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/40 text-[11px] text-muted-foreground max-w-sm">
                  <Bot className="h-3 w-3 text-cyan-400" />
                  {msg.text}
                </span>
              </div>
            );
          }

          const isMe = msg.sender === "customer";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
                    : "bg-secondary text-foreground rounded-bl-none border border-border/50"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                {msg.timestamp}
                {isMe && <CheckCheck className="h-3 w-3 text-emerald-400" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 border-t border-border/50 bg-background/50 flex items-center gap-2"
      >
        <Input
          placeholder={
            isAgentOnline
              ? "Type your question or issue..."
              : "Describe your issue (will dispatch via email)..."
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="text-xs h-9 bg-card border-border/70"
        />
        <Button type="submit" size="sm" className="h-9 px-3.5 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}
