"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Radio, Cpu } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface NodeItem {
  id: string;
  name: string;
  role: "TimescaleDB Primary" | "Redis Pub/Sub" | "API Gateway" | "Worker Engine";
  region: string;
  cpu: number;
  memory: number;
  disk: number;
  status: "healthy" | "warning" | "critical";
  uptime: string;
}

const sampleNodes: NodeItem[] = [
  {
    id: "node-pg-01",
    name: "tsdb-primary-us-east-1a",
    role: "TimescaleDB Primary",
    region: "us-east-1",
    cpu: 28,
    memory: 64,
    disk: 42,
    status: "healthy",
    uptime: "42d 18h",
  },
  {
    id: "node-redis-01",
    name: "redis-mesh-us-east-1b",
    role: "Redis Pub/Sub",
    region: "us-east-1",
    cpu: 45,
    memory: 52,
    disk: 18,
    status: "healthy",
    uptime: "31d 04h",
  },
  {
    id: "node-api-01",
    name: "pulse-api-cluster-01",
    role: "API Gateway",
    region: "us-east-1",
    cpu: 34,
    memory: 38,
    disk: 22,
    status: "healthy",
    uptime: "14d 09h",
  },
  {
    id: "node-worker-01",
    name: "pulse-worker-engine-01",
    role: "Worker Engine",
    region: "us-east-1",
    cpu: 78,
    memory: 81,
    disk: 35,
    status: "warning",
    uptime: "08d 12h",
  },
];

export function NodeList() {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-md overflow-hidden">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Infrastructure Nodes</h3>
          <p className="text-xs text-muted-foreground">Active compute, database, and cache instances</p>
        </div>
        <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
          4 / 4 Nodes Active
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Node Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>RAM</TableHead>
            <TableHead>Disk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Uptime</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sampleNodes.map((node) => (
            <TableRow key={node.id}>
              <TableCell className="font-mono text-xs font-medium text-foreground">
                <div className="flex items-center gap-2">
                  {node.role.includes("Timescale") ? (
                    <Database className="h-3.5 w-3.5 text-cyan-400" />
                  ) : node.role.includes("Redis") ? (
                    <Radio className="h-3.5 w-3.5 text-rose-400" />
                  ) : node.role.includes("Worker") ? (
                    <Cpu className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Server className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {node.name}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{node.role}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{node.region}</TableCell>
              <TableCell className="font-mono text-xs">
                <span className={node.cpu > 75 ? "text-amber-400 font-bold" : "text-foreground"}>
                  {node.cpu}%
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs">
                <span className={node.memory > 80 ? "text-amber-400 font-bold" : "text-foreground"}>
                  {node.memory}%
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{node.disk}%</TableCell>
              <TableCell>
                {node.status === "healthy" ? (
                  <Badge variant="success" className="text-[10px] py-0">Healthy</Badge>
                ) : (
                  <Badge variant="warning" className="text-[10px] py-0">High Load</Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {node.uptime}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
