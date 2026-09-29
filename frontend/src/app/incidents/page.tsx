"use client";

import React, { useState } from "react";
import { AlertTriangle, Flame, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IncidentView, IncidentData, IncidentState } from "@/components/features/incidents/incident-view";
import { CreateIncidentDialog } from "@/components/features/incidents/create-incident-dialog";
import { StatusTile } from "@/components/vengeance/status-tile";

const initialIncidents: IncidentData[] = [
  {
    id: "INC-849",
    title: "Redis Replica Lag Spikes on us-east-1 shard",
    severity: "sev2_high",
    state: "acknowledged",
    service: "redis-cluster",
    triggeredBy: "Threshold Alert Rule: Redis Consumer Lag > 25ms",
    acknowledgedBy: "alice@pulseforge.io",
    description: "Worker consumer latency increased by 35% on us-east-1 shard due to high ingestion burst.",
    createdAt: "2026-09-29 08:42 UTC",
    timeline: [
      {
        id: "evt-1",
        timestamp: "08:42:15 UTC",
        actor: "System Alert Engine",
        message: "Alert rule evaluated true. Severity: Sev-2 High. Dispatched to on-call pager.",
        stateChange: "triggered",
      },
      {
        id: "evt-2",
        timestamp: "08:44:02 UTC",
        actor: "alice@pulseforge.io",
        message: "Acknowledged incident. Taking ownership and inspecting Redis client connection pool.",
        stateChange: "acknowledged",
      },
      {
        id: "evt-3",
        timestamp: "08:51:30 UTC",
        actor: "alice@pulseforge.io",
        message: "Identified slow bulk consumer from tenant-04. Throttling consumer batch size in Redis backplane.",
      },
    ],
  },
  {
    id: "INC-848",
    title: "TimescaleDB Hypertable Compression Check Window Expired",
    severity: "sev3_medium",
    state: "resolved",
    service: "timescaledb-cluster",
    triggeredBy: "Scheduled Maintenance Watchdog",
    acknowledgedBy: "bob@pulseforge.io",
    resolvedBy: "bob@pulseforge.io",
    description: "Automatic background compression worker was delayed due to large volume migration.",
    createdAt: "2026-09-28 19:10 UTC",
    timeline: [
      {
        id: "evt-10",
        timestamp: "19:10:00 UTC",
        actor: "Watchdog Daemon",
        message: "Compression lag exceeded 2 hours.",
        stateChange: "triggered",
      },
      {
        id: "evt-11",
        timestamp: "19:15:22 UTC",
        actor: "bob@pulseforge.io",
        message: "Acknowledged and executed manual compress_chunk() on chunk _hyper_1_18.",
        stateChange: "acknowledged",
      },
      {
        id: "evt-12",
        timestamp: "19:30:14 UTC",
        actor: "bob@pulseforge.io",
        message: "Compression achieved 8.4x ratio. All chunks nominal.",
        stateChange: "resolved",
      },
    ],
  },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentData[]>(initialIncidents);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("INC-849");

  const handleCreateIncident = (data: {
    title: string;
    severity: "sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low";
    service: string;
    description: string;
  }) => {
    const newId = `INC-${Math.floor(850 + Math.random() * 50)}`;
    const nowStr = new Date().toUTCString().slice(17, 25) + " UTC";

    const newInc: IncidentData = {
      id: newId,
      title: data.title,
      severity: data.severity,
      state: "triggered",
      service: data.service,
      triggeredBy: "Manual Engineer Declaration",
      description: data.description,
      createdAt: nowStr,
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: nowStr,
          actor: "Current User",
          message: "Incident manually triggered. On-call alert notifications dispatched.",
          stateChange: "triggered",
        },
      ],
    };

    setIncidents([newInc, ...incidents]);
    setSelectedIncidentId(newId);
  };

  const handleStateTransition = (incidentId: string, newState: IncidentState) => {
    const nowStr = new Date().toUTCString().slice(17, 25) + " UTC";
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const updateTimeline = [
          ...inc.timeline,
          {
            id: `evt-${Date.now()}`,
            timestamp: nowStr,
            actor: "Current User",
            message: `Transitioned state to ${newState.toUpperCase()}.`,
            stateChange: newState,
          },
        ];

        return {
          ...inc,
          state: newState,
          acknowledgedBy: newState === "acknowledged" ? "Current User" : inc.acknowledgedBy,
          resolvedBy: newState === "resolved" ? "Current User" : inc.resolvedBy,
          timeline: updateTimeline,
        };
      })
    );
  };

  const handleAddUpdate = (incidentId: string, updateMessage: string) => {
    const nowStr = new Date().toUTCString().slice(17, 25) + " UTC";
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        return {
          ...inc,
          timeline: [
            ...inc.timeline,
            {
              id: `evt-${Date.now()}`,
              timestamp: nowStr,
              actor: "Current User",
              message: updateMessage,
            },
          ],
        };
      })
    );
  };

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const activeCount = incidents.filter((i) => i.state !== "resolved" && i.state !== "postmortem").length;

  return (
    <div className="space-y-6 px-6 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Incident War Room
            {activeCount > 0 ? (
              <Badge variant="warning" className="text-xs">{activeCount} Active Incident</Badge>
            ) : (
              <Badge variant="success" className="text-xs">No Active Outages</Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Formal Incident State Machine &bull; Realtime Collaboration &bull; Alert Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <CreateIncidentDialog onIncidentCreated={handleCreateIncident} />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusTile
          label="Active Incidents"
          value={activeCount}
          subtext="Under active mitigation"
          status={activeCount > 0 ? "degraded" : "operational"}
          icon={<AlertTriangle className="h-4 w-4 text-amber-400" />}
        />
        <StatusTile
          label="Mean Time to Ack (MTTA)"
          value="2.4 min"
          subtext="Target: < 5 min"
          status="operational"
          icon={<Flame className="h-4 w-4 text-rose-400" />}
        />
        <StatusTile
          label="Mean Time to Resolve (MTTR)"
          value="24.8 min"
          subtext="-12% this month"
          status="operational"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        />
        <StatusTile
          label="On-Call Rotation"
          value="Team Alpha"
          subtext="Primary: alice@pulseforge.io"
          status="info"
          icon={<ShieldAlert className="h-4 w-4 text-cyan-400" />}
        />
      </div>

      {/* War Room Layout: Sidebar List + Selected Incident View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Incident List Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            All Incidents ({incidents.length})
          </h3>
          <div className="space-y-2">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500/50 bg-card shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "border-border/60 bg-card/60 hover:bg-card/90"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-foreground">{inc.id}</span>
                    <Badge
                      variant={inc.state === "triggered" ? "critical" : inc.state === "acknowledged" ? "warning" : "success"}
                      className="text-[10px] py-0"
                    >
                      {inc.state.toUpperCase()}
                    </Badge>
                  </div>
                  <h4 className="mt-1 text-xs font-medium text-foreground line-clamp-1">{inc.title}</h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="capitalize">{inc.service}</span>
                    <span>{inc.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Incident War Room View */}
        <div className="lg:col-span-2">
          {selectedIncident ? (
            <IncidentView
              incident={selectedIncident}
              onStateTransition={handleStateTransition}
              onAddUpdate={handleAddUpdate}
            />
          ) : (
            <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground text-sm">
              Select an incident from the list
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
