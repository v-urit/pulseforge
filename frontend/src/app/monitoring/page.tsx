"use client";

import React, { useState } from "react";
import { Database, Radio, Zap, Play, Pause, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricChart } from "@/components/features/monitoring/metric-chart";
import { NodeList } from "@/components/features/monitoring/node-list";
import { IngestModal } from "@/components/features/monitoring/ingest-modal";
import { StatusTile } from "@/components/vengeance/status-tile";

export default function MonitoringPage() {
  const [isLive, setIsLive] = useState(true);

  // Sample real-time series telemetry
  const throughputData = [41.2, 43.5, 45.1, 48.9, 47.2, 49.8, 51.2, 48.9];
  const latencyData = [16.2, 17.5, 19.1, 18.4, 21.0, 18.2, 17.9, 18.4];
  const redisMemoryData = [512, 524, 530, 542, 538, 549, 560, 552];
  const queueLagData = [12, 18, 14, 35, 42, 28, 19, 15];

  return (
    <div className="space-y-6 px-6 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Infrastructure Monitoring
            <Badge variant="success" className="text-xs">Live Stream</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            TimescaleDB Hypertable Ingestion &bull; Node Health &bull; Resource Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant={isLive ? "glow" : "outline"}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? <Pause className="h-3.5 w-3.5 text-emerald-400" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isLive ? "Stream Active" : "Paused"}</span>
          </Button>
          <IngestModal />
        </div>
      </div>

      {/* Realtime KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusTile
          label="Total Metrics Ingested"
          value="1.84M"
          subtext="Past 24 hours"
          status="operational"
          icon={<Zap className="h-4 w-4 text-emerald-400" />}
        />
        <StatusTile
          label="Hypertable Chunks"
          value="48 Active"
          subtext="1-day interval partitioning"
          status="operational"
          icon={<Database className="h-4 w-4 text-cyan-400" />}
        />
        <StatusTile
          label="Compression Ratio"
          value="8.4x"
          subtext="TimescaleDB columnar"
          status="operational"
          icon={<Layers className="h-4 w-4 text-violet-400" />}
        />
        <StatusTile
          label="Redis Pub/Sub QPS"
          value="12.4k"
          subtext="Zero message drop"
          status="operational"
          icon={<Radio className="h-4 w-4 text-rose-400" />}
        />
      </div>

      {/* Telemetry Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricChart
          metric="INGESTION RATE"
          title="Telemetry Ingest Throughput"
          currentValue="48.9k/s"
          unit="k/s"
          data={throughputData}
          color="emerald"
        />
        <MetricChart
          metric="QUERY LATENCY"
          title="TimescaleDB P99 Read Latency"
          currentValue="18.4ms"
          unit="ms"
          data={latencyData}
          color="cyan"
        />
        <MetricChart
          metric="REDIS MEMORY"
          title="Cache & Pub/Sub Memory Usage"
          currentValue="552MB"
          unit="MB"
          data={redisMemoryData}
          color="violet"
        />
        <MetricChart
          metric="CONSUMER LAG"
          title="Worker Queue Processing Lag"
          currentValue="15ms"
          unit="ms"
          data={queueLagData}
          color="amber"
        />
      </div>

      {/* Node Table */}
      <NodeList />
    </div>
  );
}
