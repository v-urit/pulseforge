"use client";

import React, { useState } from "react";
import {
  Shield,
  Users,
  Radio,
  FileText,
  Send,
  Ban,
  RotateCcw,
  Activity,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { StatusTile } from "@/components/vengeance/status-tile";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  tenant: string;
  role: "super_admin" | "admin" | "support_agent" | "member";
  provider: "email" | "google" | "github";
  isActive: boolean;
  activeSessions: number;
}

const sampleUsers: AdminUser[] = [
  {
    id: "usr-01",
    email: "sarah.admin@pulseforge.io",
    name: "Sarah Chen",
    tenant: "Enterprise Ops (Tenant-01)",
    role: "super_admin",
    provider: "google",
    isActive: true,
    activeSessions: 2,
  },
  {
    id: "usr-02",
    email: "alex.support@pulseforge.io",
    name: "Alex Rivera",
    tenant: "Customer Success (Tenant-01)",
    role: "support_agent",
    provider: "email",
    isActive: true,
    activeSessions: 1,
  },
  {
    id: "usr-03",
    email: "lead.dev@acme-corp.com",
    name: "David Kim",
    tenant: "Acme Corp (Tenant-04)",
    role: "admin",
    provider: "github",
    isActive: true,
    activeSessions: 3,
  },
  {
    id: "usr-04",
    email: "engineer@fintech-cloud.net",
    name: "Elena Rostova",
    tenant: "Fintech Cloud (Tenant-09)",
    role: "member",
    provider: "email",
    isActive: false,
    activeSessions: 0,
  },
];

const sampleAuditLogs = [
  {
    id: "aud-991",
    user: "sarah.admin@pulseforge.io",
    action: "AUTH_TOKEN_ROTATION",
    ip: "192.168.1.104",
    status: "SUCCESS",
    time: "2 mins ago",
  },
  {
    id: "aud-990",
    user: "system.alert_engine",
    action: "INCIDENT_STATE_TRANSITION",
    ip: "10.0.4.12",
    status: "TRIGGERED",
    time: "8 mins ago",
  },
  {
    id: "aud-989",
    user: "alex.support@pulseforge.io",
    action: "SUPPORT_SESSION_ACCEPTED",
    ip: "172.16.0.44",
    status: "SUCCESS",
    time: "24 mins ago",
  },
  {
    id: "aud-988",
    user: "198.51.100.22",
    action: "TOKEN_FAMILY_REUSE_DETECTED",
    ip: "198.51.100.22",
    status: "REVOKED_ALL",
    time: "1 hour ago",
  },
];

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(sampleUsers);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const toggleUserBan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const invalidateSessions = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, activeSessions: 0 } : u))
    );
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastMessage("");
      setBroadcastSent(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 px-6 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Admin Super-Console
            <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs">
              Super Admin Access
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-Tenant Governance &bull; Session Invalidation &bull; Live Telemetry &bull; Audit Trail
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs">
            Cluster Protected
          </Badge>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusTile
          label="Active WS Connections"
          value="342"
          subtext="Distributed across 4 pods"
          status="operational"
          icon={<Radio className="h-4 w-4 text-emerald-400" />}
        />
        <StatusTile
          label="Registered Tenants"
          value="18"
          subtext="Mandatory IDOR Isolation"
          status="operational"
          icon={<Shield className="h-4 w-4 text-cyan-400" />}
        />
        <StatusTile
          label="Go Goroutines"
          value="1,420"
          subtext="GC pause: 0.18ms"
          status="operational"
          icon={<Activity className="h-4 w-4 text-violet-400" />}
        />
        <StatusTile
          label="Token Reuse Detections"
          value="0 Active"
          subtext="Family revocation active"
          status="operational"
          icon={<Lock className="h-4 w-4 text-emerald-400" />}
        />
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-secondary/60 border border-border/50">
          <TabsTrigger value="users" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            <span>User Management & RBAC</span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            <span>Live Telemetry</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            <span>Security Audit Logs</span>
          </TabsTrigger>
          <TabsTrigger value="broadcast" className="gap-1.5 text-xs">
            <Send className="h-3.5 w-3.5" />
            <span>System Broadcasts</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Users */}
        <TabsContent value="users">
          <div className="rounded-xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">User & Session Governance</h3>
                <p className="text-xs text-muted-foreground">Manage roles, ban accounts, or revoke all active token families</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Active Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Security Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{u.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.tenant}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          u.role === "super_admin"
                            ? "border-purple-500/40 text-purple-400 bg-purple-500/10"
                            : u.role === "admin"
                            ? "border-cyan-500/40 text-cyan-400 bg-cyan-500/10"
                            : u.role === "support_agent"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-border/60 text-muted-foreground"
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs capitalize text-muted-foreground">{u.provider}</TableCell>
                    <TableCell className="font-mono text-xs">{u.activeSessions} active</TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge variant="success" className="text-[10px] py-0">Active</Badge>
                      ) : (
                        <Badge variant="critical" className="text-[10px] py-0">Banned</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[11px] gap-1 text-amber-400 hover:text-amber-300 border-border/70"
                          onClick={() => invalidateSessions(u.id)}
                          title="Revoke all token families in Redis"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Revoke Sessions</span>
                        </Button>
                        <Button
                          variant={u.isActive ? "destructive" : "outline"}
                          size="sm"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => toggleUserBan(u.id)}
                        >
                          <Ban className="h-3 w-3" />
                          <span>{u.isActive ? "Ban" : "Unban"}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Telemetry */}
        <TabsContent value="telemetry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/70 bg-card/80 p-5 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400" />
                WebSocket Backplane Status
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Adapter</span>
                  <span className="font-mono text-foreground">Gorilla (behind realtime.Hub)</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Pub/Sub Transport</span>
                  <span className="font-mono text-emerald-400">Redis 7 Cluster Mesh</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Ticket TTL</span>
                  <span className="font-mono text-foreground">30 seconds (single-use)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">Total Messages Broadcast</span>
                  <span className="font-mono text-foreground">4.89M past 24h</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-card/80 p-5 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                Go Runtime Memory & GC
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Heap Allocated</span>
                  <span className="font-mono text-foreground">48.2 MB</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Active OS Threads</span>
                  <span className="font-mono text-foreground">16 Threads</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Last GC Duration</span>
                  <span className="font-mono text-emerald-400">0.18 ms</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">Toolchain</span>
                  <span className="font-mono text-foreground">Go 1.26.0</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Audit Logs */}
        <TabsContent value="audit">
          <div className="rounded-xl border border-border/70 bg-card/80 backdrop-blur-md overflow-hidden">
            <div className="p-4 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Immutable Security Audit Logs</h3>
              <p className="text-xs text-muted-foreground">Audited authentication events, privilege escalations, and token reuse attacks</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleAuditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.id}</TableCell>
                    <TableCell className="font-mono text-xs text-foreground">{log.user}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.action}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status.includes("SUCCESS") ? "success" : "critical"}
                        className="text-[10px] py-0 font-mono"
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{log.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 4: Broadcast */}
        <TabsContent value="broadcast">
          <div className="max-w-2xl rounded-xl border border-border/70 bg-card/80 p-5 backdrop-blur-md space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-400" />
                System-Wide Maintenance Broadcast
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dispatch notifications across all connected tenants via WebSocket backplane and worker email queue.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <Textarea
                placeholder="Enter maintenance banner or emergency notice..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={3}
                required
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Targets all 18 active tenants and connected sessions.
                </span>
                <Button type="submit" size="sm" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="h-3.5 w-3.5" />
                  <span>Dispatch Broadcast</span>
                </Button>
              </div>

              {broadcastSent && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Broadcast successfully queued in cmd/worker and pushed to Redis Pub/Sub!</span>
                </div>
              )}
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
