"use client";

import React from "react";
import { Headset, Mail, Clock, HelpCircle, ShieldAlert, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportChatPanel } from "@/components/features/support/support-chat-panel";
import { StatusTile } from "@/components/vengeance/status-tile";

export default function SupportPage() {
  return (
    <div className="space-y-6 px-6 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Live Customer Support
            <Badge variant="success" className="text-xs">Agents Online</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ticket-Authenticated WebSocket Chat &bull; Automatic 24/7 Email Queue Fallback
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/80">
            <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
            <span>Developer Docs</span>
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusTile
          label="Support Desk"
          value="Online"
          subtext="WebSocket active"
          status="operational"
          icon={<Headset className="h-4 w-4 text-emerald-400" />}
        />
        <StatusTile
          label="Median Response Time"
          value="45 sec"
          subtext="During active hours"
          status="operational"
          icon={<Clock className="h-4 w-4 text-cyan-400" />}
        />
        <StatusTile
          label="Email Fallback Queue"
          value="Ready"
          subtext="cmd/worker SMTP dispatch"
          status="operational"
          icon={<Mail className="h-4 w-4 text-amber-400" />}
        />
        <StatusTile
          label="SLA Compliance"
          value="99.8%"
          subtext="Enterprise tier"
          status="operational"
          icon={<ShieldAlert className="h-4 w-4 text-emerald-400" />}
        />
      </div>

      {/* Support Center Layout: Knowledge & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Knowledge & FAQs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border/70 bg-card/70 p-5 backdrop-blur-md">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-emerald-400" />
              Frequently Asked Questions
            </h3>
            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-lg border border-border/40 bg-secondary/30">
                <h4 className="text-xs font-semibold text-foreground">How does the WebSocket ticket auth work?</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Call <code>POST /api/v1/ws/ticket</code> with your bearer JWT to receive a 30-second single-use ticket, then connect to <code>/api/v1/ws?ticket=...</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-secondary/30">
                <h4 className="text-xs font-semibold text-foreground">What happens when agents are offline?</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Messages are handed to <code>cmd/worker</code>, which automatically emails your query to our on-call engineers and confirms delivery to your inbox.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border/40 bg-secondary/30">
                <h4 className="text-xs font-semibold text-foreground">How do I verify tenant boundaries?</h4>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  Every query at the repository layer mandates a <code>tenant_id</code> filter, preventing IDOR and ensuring multi-tenant isolation.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs text-emerald-300">
            <strong>Enterprise Priority:</strong> Sev-1 outages automatically escalate to our 24/7 pager rotations even outside standard support chat hours.
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="lg:col-span-3">
          <SupportChatPanel initialAgentOnline={true} />
        </div>
      </div>
    </div>
  );
}
