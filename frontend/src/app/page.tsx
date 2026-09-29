"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  Flame,
  Headset,
  Radio,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusTile } from "@/components/vengeance/status-tile";
import { BentoGrid, BentoCard } from "@/components/vengeance/bento-grid";
import { AnimatedCounter } from "@/components/vengeance/animated-counter";

export default function DashboardPage() {
  const [ingestRate] = useState(48920);
  const [activeIncidents] = useState(1);
  const [activeConnections] = useState(342);

  return (
    <div className="space-y-6 px-6 py-6 max-w-7xl mx-auto">
      {/* Top Banner / System State */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Mission Control
            <Badge variant="success" className="text-xs">All Systems Nominal</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            TimescaleDB Ingestion Cluster &bull; Redis Pub/Sub Backplane &bull; War Room Hub
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="glow" size="sm" className="gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>Live Stream</span>
          </Button>
          <Button variant="outline" size="sm" className="border-border/80">
            Create Incident
          </Button>
        </div>
      </div>

      {/* Hero Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusTile
          label="Telemetry Ingestion"
          value={<AnimatedCounter value={ingestRate} formatter={(v) => `${(v / 1000).toFixed(1)}k msg/s`} />}
          subtext="TimescaleDB Hypertable batching"
          status="operational"
          icon={<Zap className="h-4 w-4 text-emerald-400" />}
        />
        <StatusTile
          label="Active Incidents"
          value={activeIncidents}
          subtext="1 Sev-2 incident acknowledged"
          status="degraded"
          icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
        />
        <StatusTile
          label="P99 Cluster Latency"
          value="18.4 ms"
          subtext="-2.1ms from baseline"
          status="operational"
          icon={<Activity className="h-4 w-4 text-cyan-400" />}
        />
        <StatusTile
          label="Live Support Queue"
          value="2 Online"
          subtext="WebSocket ticket active"
          status="operational"
          icon={<Headset className="h-4 w-4 text-emerald-400" />}
        />
      </div>

      {/* Bento Grid Telemetry Layout */}
      <BentoGrid>
        {/* Active Incident War Room Card */}
        <BentoCard colSpan={2} className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Active War Room</h3>
            </div>
            <Badge variant="warning" className="text-[10px]">ACKNOWLEDGED</Badge>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-amber-300">INC-849: Redis Replica Lag Spikes</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Worker consumer latency increased by 35% on us-east-1 shard.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px]">Sev-2</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground border-t border-amber-500/10 pt-2">
                <span>Lead: alice@pulseforge.io</span>
                <span>Ack: 12m ago</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Next review in 18 minutes</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-emerald-400 hover:text-emerald-300">
                Join War Room &rarr;
              </Button>
            </div>
          </div>
        </BentoCard>

        {/* Live Cluster Pipeline Card */}
        <BentoCard colSpan={2}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Cluster Pipeline Health</h3>
            </div>
            <Badge variant="success" className="text-[10px]">99.99% UP</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="rounded-lg border border-border/40 bg-secondary/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-cyan-400" /> Timescale</span>
                <span className="text-emerald-400 font-mono">0.8ms</span>
              </div>
              <div className="mt-2 text-base font-bold text-foreground">PostgreSQL 16</div>
              <div className="text-[11px] text-muted-foreground">Hypertable compression enabled</div>
            </div>
            <div className="rounded-lg border border-border/40 bg-secondary/40 p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-rose-400" /> Redis 7+</span>
                <span className="text-emerald-400 font-mono">0.3ms</span>
              </div>
              <div className="mt-2 text-base font-bold text-foreground">Pub/Sub Mesh</div>
              <div className="text-[11px] text-muted-foreground">{activeConnections} active WS sockets</div>
            </div>
          </div>
        </BentoCard>

        {/* Security & Audit Summary */}
        <BentoCard colSpan={2}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">Security Core & Audit</h3>
            </div>
            <Badge variant="outline" className="text-[10px]">Argon2id + HMAC</Badge>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-muted-foreground">Token Family Rotation</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Replay Defense Active
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-muted-foreground">Multi-Tenancy Isolation</span>
              <span className="text-emerald-400 font-medium">Tenant ID Enforced</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">WS Auth Handshake</span>
              <span className="text-emerald-400 font-medium">Single-use 30s Ticket</span>
            </div>
          </div>
        </BentoCard>

        {/* Live Support Quick Widget */}
        <BentoCard colSpan={2}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Headset className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-foreground">Live Customer Support</h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Agent Online
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Realtime dual-channel: WebSocket when support agent is active, automatic email queue fallback when offline.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="w-full text-xs font-medium">
              Open Support Inbox
            </Button>
          </div>
        </BentoCard>
      </BentoGrid>
    </div>
  );
}
