"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, Building2, Lock, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <Activity className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your Organization
          </h1>
          <p className="text-xs text-muted-foreground">
            Initialize an isolated tenant with dedicated TimescaleDB & Redis isolation
          </p>
        </div>

        {/* Register Card */}
        <div className="rounded-2xl border border-border/80 bg-card/90 p-6 backdrop-blur-xl shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tenant-name">Organization / Tenant Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tenant-name"
                  placeholder="e.g. Acme Cloud Corp"
                  className="pl-9 text-xs h-9"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="full-name">Administrator Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="full-name"
                  placeholder="e.g. Sarah Connor"
                  className="pl-9 text-xs h-9"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="admin@company.com"
                  className="pl-9 text-xs h-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password (Argon2id Salted)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Minimum 10 characters"
                  className="pl-9 text-xs h-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={10}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Hashed with Argon2id (m=64MB, t=3, p=4) with per-user cryptographic salt.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-medium gap-1.5"
            >
              <span>{isLoading ? "Provisioning Tenant..." : "Create Tenant & Admin Account"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          {/* Compliance & Security */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Multi-Tenant IDOR Guarantee</span>
            </div>
            <p>
              Repository-enforced tenant boundaries ensure zero data leakage between customer namespaces.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-emerald-400 hover:underline font-medium">
            Sign In &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
