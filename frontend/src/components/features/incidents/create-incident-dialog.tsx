"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Plus } from "lucide-react";

interface CreateIncidentDialogProps {
  onIncidentCreated?: (incident: {
    title: string;
    severity: "sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low";
    description: string;
    service: string;
  }) => void;
}

export function CreateIncidentDialog({ onIncidentCreated }: CreateIncidentDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low">("sev2_high");
  const [service, setService] = useState("redis-cluster");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (onIncidentCreated) {
      onIncidentCreated({
        title,
        severity,
        service,
        description,
      });
    }

    // Reset and close
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium">
          <Plus className="h-3.5 w-3.5" />
          <span>Declare Incident</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <DialogTitle>Declare War Room Incident</DialogTitle>
            </div>
            <DialogDescription>
              Trigger a new incident. This will page on-call responders and dispatch alerts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="inc-title">Incident Title</Label>
              <Input
                id="inc-title"
                placeholder="e.g. TimescaleDB Ingestion Lag > 500ms"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="inc-severity">Severity Level</Label>
                <select
                  id="inc-severity"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as "sev1_critical" | "sev2_high" | "sev3_medium" | "sev4_low")
                  }
                >
                  <option value="sev1_critical" className="bg-card text-rose-400">Sev-1 Critical (Outage)</option>
                  <option value="sev2_high" className="bg-card text-amber-400">Sev-2 High (Degraded)</option>
                  <option value="sev3_medium" className="bg-card text-yellow-400">Sev-3 Medium (Warning)</option>
                  <option value="sev4_low" className="bg-card text-blue-400">Sev-4 Low (Minor)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="inc-service">Affected Service</Label>
                <select
                  id="inc-service"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option value="timescaledb-cluster" className="bg-card">TimescaleDB Cluster</option>
                  <option value="redis-cluster" className="bg-card">Redis Pub/Sub Mesh</option>
                  <option value="api-gateway" className="bg-card">API Gateway & WS</option>
                  <option value="worker-dispatch" className="bg-card">Worker Alert Engine</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inc-desc">Symptoms & Blast Radius</Label>
              <Textarea
                id="inc-desc"
                placeholder="Describe observed symptoms, error spikes, and affected tenants..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
              Trigger Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
