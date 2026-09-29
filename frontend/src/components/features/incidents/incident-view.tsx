"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export type IncidentState = "triggered" | "acknowledged" | "resolved" | "postmortem";
export type IncidentSeverity = "sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low";

export interface IncidentData {
  id: string;
  title: string;
  severity: IncidentSeverity;
  state: IncidentState;
  service: string;
  triggeredBy: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  description: string;
  createdAt: string;
  timeline: Array<{
    id: string;
    timestamp: string;
    actor: string;
    message: string;
    stateChange?: IncidentState;
  }>;
}

interface IncidentViewProps {
  incident: IncidentData;
  onStateTransition: (incidentId: string, newState: IncidentState) => void;
  onAddUpdate: (incidentId: string, updateMessage: string) => void;
}

export function IncidentView({ incident, onStateTransition, onAddUpdate }: IncidentViewProps) {
  const [updateText, setUpdateText] = useState("");

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return;
    onAddUpdate(incident.id, updateText);
    setUpdateText("");
  };

  const severityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case "sev1_critical":
        return <Badge variant="critical">Sev-1 Critical</Badge>;
      case "sev2_high":
        return <Badge variant="warning">Sev-2 High</Badge>;
      case "sev3_medium":
        return <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">Sev-3 Medium</Badge>;
      case "sev4_low":
        return <Badge variant="outline" className="text-blue-400 border-blue-500/30">Sev-4 Low</Badge>;
    }
  };

  const stateBadge = (st: IncidentState) => {
    switch (st) {
      case "triggered":
        return <Badge variant="critical" className="animate-pulse">TRIGGERED</Badge>;
      case "acknowledged":
        return <Badge variant="warning">ACKNOWLEDGED</Badge>;
      case "resolved":
        return <Badge variant="success">RESOLVED</Badge>;
      case "postmortem":
        return <Badge variant="outline" className="text-purple-400 border-purple-500/30">POSTMORTEM</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden">
      {/* Incident Top Bar */}
      <div className="p-5 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{incident.id}</span>
            <h2 className="text-lg font-bold text-foreground">{incident.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {severityBadge(incident.severity)}
            {stateBadge(incident.state)}
          </div>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">{incident.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/30 pt-3">
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Started: {incident.createdAt}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            Triggered by: <span className="text-foreground">{incident.triggeredBy}</span>
          </span>
          {incident.acknowledgedBy && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
              Lead: <span className="text-amber-400">{incident.acknowledgedBy}</span>
            </span>
          )}
          {incident.resolvedBy && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Resolved by: <span className="text-emerald-400">{incident.resolvedBy}</span>
            </span>
          )}
        </div>
      </div>

      {/* State Machine Transition Controls */}
      <div className="px-5 py-3.5 bg-background/50 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Lifecycle State:</span>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className={incident.state === "triggered" ? "text-rose-400 font-bold" : "text-muted-foreground"}>
              Triggered
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={incident.state === "acknowledged" ? "text-amber-400 font-bold" : "text-muted-foreground"}>
              Acknowledged
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={incident.state === "resolved" ? "text-emerald-400 font-bold" : "text-muted-foreground"}>
              Resolved
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={incident.state === "postmortem" ? "text-purple-400 font-bold" : "text-muted-foreground"}>
              Postmortem
            </span>
          </div>
        </div>

        {/* Transition Action Buttons */}
        <div className="flex items-center gap-2">
          {incident.state === "triggered" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
              onClick={() => onStateTransition(incident.id, "acknowledged")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Acknowledge & Take Ownership</span>
            </Button>
          )}

          {incident.state === "acknowledged" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={() => onStateTransition(incident.id, "resolved")}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark Resolved</span>
            </Button>
          )}

          {incident.state === "resolved" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20"
              onClick={() => onStateTransition(incident.id, "postmortem")}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Initiate Postmortem</span>
            </Button>
          )}

          {incident.state === "postmortem" && (
            <Badge variant="outline" className="text-purple-400 border-purple-500/30">
              Terminal State: Postmortem Ready
            </Badge>
          )}
        </div>
      </div>

      {/* War Room Timeline & Discussion */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          War Room Event Log & Updates
        </h4>

        <div className="space-y-3">
          {incident.timeline.map((event) => (
            <div
              key={event.id}
              className="relative pl-6 pb-3 border-l-2 border-border/40 last:border-l-transparent last:pb-0"
            >
              <span className="absolute -left-[7px] top-0 h-3 w-3 rounded-full bg-card border-2 border-emerald-500" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{event.actor}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{event.timestamp}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{event.message}</p>
            </div>
          ))}
        </div>

        {/* Post Update Form */}
        <form onSubmit={handlePostUpdate} className="mt-4 pt-3 border-t border-border/40 space-y-2">
          <Textarea
            placeholder="Post technical update, runbook notes, or mitigation steps to the War Room..."
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="text-xs h-8">
              Post Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
