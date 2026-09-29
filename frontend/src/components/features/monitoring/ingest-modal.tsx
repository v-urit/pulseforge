"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Terminal, Copy, Check, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function IngestModal() {
  const [copied, setCopied] = useState(false);
  const apiKey = "pf_live_sec_9934afbc8821094892e8";

  const curlSnippet = `curl -X POST http://localhost:8080/api/v1/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "metrics": [
      {
        "metric": "system.cpu.utilization",
        "value": 42.8,
        "tags": { "host": "srv-prod-01", "region": "us-east-1" },
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
      }
    ]
  }'`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-border/80 text-xs">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span>Ingestion Setup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-400" />
            <DialogTitle>TimescaleDB Telemetry Ingestion</DialogTitle>
          </div>
          <DialogDescription>
            Send batch time-series points to your tenant hypertable via authenticated REST API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tenant Active API Key
            </label>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-border/60 bg-background/80 p-2.5 font-mono text-xs text-emerald-400">
              <span>{apiKey}</span>
              <Badge variant="outline" className="border-emerald-500/40 text-[10px] text-emerald-400">
                Active
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                cURL Ingestion Example
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border/60 bg-black/80 p-3 font-mono text-[11px] leading-relaxed text-zinc-300">
              {curlSnippet}
            </pre>
          </div>

          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-300">
            <strong>Compression Note:</strong> Metrics inserted into TimescaleDB are automatically compressed after 2 hours and partitioned into 1-day chunks under the Community Edition license.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
