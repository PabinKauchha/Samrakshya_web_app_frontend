"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Activity,
  AlertTriangle,
  Users,
  LayoutDashboard,
  Siren,
  FileVideo,
  Radio,
  Command,
  Cpu,
  Gauge,
  Globe2,
  Terminal,
  Zap,
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalSOS: number;
  activeSOS: number;
  totalIncidents: number;
};

type SOS = {
  _id: string;
  createdAt?: string;
  status: string;
  user?: { name?: string; email?: string };
};

const API = "http://localhost:4321";

function relTime(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${h}h ago`;
}

export function HeroSectionAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<SOS[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // stats + recent alerts
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;

    let cancelled = false;
    const load = async () => {
      try {
        const [s, a] = await Promise.all([
          axios.get<{ data: Stats }>(`${API}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<{ data: SOS[] }>(`${API}/api/admin/active-sos`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (cancelled) return;
        setStats(s.data.data);
        setRecent(a.data.data ?? []);
      } catch {
        // silent
      }
    };
    load();
    const i = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, []);

  const activeCount = stats?.activeSOS ?? 0;
  const hasEmergency = activeCount > 0;
  const totalSos = stats?.totalSOS ?? 0;
  const resolveRate = useMemo(() => {
    if (!stats || totalSos === 0) return 100;
    const resolved = Math.max(0, totalSos - activeCount);
    return Math.round((resolved / totalSos) * 100);
  }, [stats, totalSos, activeCount]);

  // Build a small activity ticker from recent alerts + synthetic system events
  const ticker = useMemo(() => {
    const items: { kind: "alert" | "sys"; label: string; sub: string }[] = [];
    recent.slice(0, 2).forEach((a) => {
      items.push({
        kind: "alert",
        label: `SOS from ${a.user?.name || "Unknown"}`,
        sub: relTime(a.createdAt),
      });
    });
    items.push({ kind: "sys", label: "Admin session authorized", sub: "secure channel" });
    items.push({ kind: "sys", label: "Stats snapshot refreshed", sub: "every 15s" });
    return items.slice(0, 3);
  }, [recent]);

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.2),transparent_38%),linear-gradient(180deg,rgba(253,242,248,1),rgba(252,231,243,0.95)_46%,rgba(253,242,248,1)_88%)]" />
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(136,19,55,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(136,19,55,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at top, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at top, black 40%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-140px] top-40 h-80 w-80 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute right-[-120px] top-20 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Status bar */}
          <div className="mb-10 flex flex-wrap items-center gap-2 text-[11px] font-mono text-foreground/55">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-2.5 py-1 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${hasEmergency ? "bg-red-400" : "bg-emerald-400"} opacity-75`} />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${hasEmergency ? "bg-red-500" : "bg-emerald-500"}`} />
              </span>
              <span className="uppercase tracking-[0.14em]">{hasEmergency ? "Alert" : "Operational"}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-2.5 py-1 backdrop-blur">
              <Cpu className="h-3 w-3" />
              v1.4 · admin build
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-2.5 py-1 backdrop-blur">
              <Radio className="h-3 w-3" />
              Real-time · 15s refresh
            </span>
            <span className="ml-auto rounded-full border border-primary/15 bg-white/80 px-2.5 py-1 backdrop-blur">
              {now.toLocaleTimeString([], { hour12: false })} · {now.toLocaleDateString()}
            </span>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            {/* ── Left: copy + feature strip ───────────────────────────── */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-white/85 px-3 py-1.5 backdrop-blur">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-amber-500 to-orange-600">
                  <Terminal className="h-3 w-3 text-white" />
                </span>
                <span className="text-xs font-semibold tracking-wide text-foreground/80">
                  Admin Control Center
                </span>
                <span className="ml-1 hidden items-center gap-1 rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] font-mono text-foreground/60 sm:inline-flex">
                  <Command className="h-2.5 w-2.5" />
                  K
                </span>
              </div>

              <h1 className="mb-5 text-4xl font-black leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-[4.3rem]">
                Monitor, manage, and respond to{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary via-rose-500 to-fuchsia-600 bg-clip-text text-transparent">
                    safety events
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-primary/20 via-rose-400/20 to-fuchsia-500/20 blur-sm" />
                </span>{" "}
                in real time.
              </h1>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg">
                A single operational view of live SOS alerts, incident reports, and user activity —
                built for calm, confident emergency response.
              </p>

              <div className="mb-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 gap-2 rounded-2xl bg-gradient-to-r from-primary to-[oklch(0.48_0.22_330)] font-semibold text-white shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-shadow"
                  asChild
                >
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    Open Admin Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-12 gap-2 rounded-2xl ${
                    hasEmergency
                      ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-primary/30 bg-white text-foreground hover:bg-pink-50"
                  }`}
                  asChild
                >
                  <Link href="/admin">
                    <Siren className={`h-4 w-4 ${hasEmergency ? "animate-pulse" : ""}`} />
                    View Active Alerts
                    {hasEmergency && (
                      <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>

              {/* Inline meta strip */}
              <div className="grid gap-3 rounded-2xl border border-primary/15 bg-white/75 p-4 backdrop-blur-sm sm:grid-cols-3">
                <MetaBlock
                  icon={Gauge}
                  label="Resolve Rate"
                  value={`${resolveRate}%`}
                  hint={`${totalSos - activeCount}/${totalSos} alerts`}
                  tint="emerald"
                />
                <MetaBlock
                  icon={Globe2}
                  label="Coverage"
                  value="24/7"
                  hint="Autonomous polling"
                  tint="blue"
                />
                <MetaBlock
                  icon={Zap}
                  label="Response"
                  value="< 1s"
                  hint="UI acknowledge"
                  tint="violet"
                />
              </div>
            </div>

            {/* ── Right: live control panel ────────────────────────────── */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.2rem] bg-gradient-to-br from-primary/20 via-fuchsia-400/15 to-cyan-400/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-white via-pink-50/80 to-white p-5 shadow-2xl shadow-primary/15 backdrop-blur-xl sm:p-6">
                {/* Panel header */}
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-primary/10 pb-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/45">
                      samrakshya/admin · live
                    </p>
                    <h3 className="mt-1 text-lg font-black text-foreground truncate">
                      System Overview
                    </h3>
                  </div>
                  <StatusRing hasEmergency={hasEmergency} resolveRate={resolveRate} />
                </div>

                {/* Mini stats */}
                <div className="mb-5 grid gap-2 sm:grid-cols-3">
                  <StatTile icon={Users} label="Users" value={stats?.totalUsers ?? "—"} tint="blue" />
                  <StatTile
                    icon={AlertTriangle}
                    label="Active SOS"
                    value={activeCount}
                    tint={hasEmergency ? "red" : "emerald"}
                    pulse={hasEmergency}
                  />
                  <StatTile
                    icon={FileVideo}
                    label="Incidents"
                    value={stats?.totalIncidents ?? "—"}
                    tint="violet"
                  />
                </div>

                {/* Activity ticker */}
                <div className="mb-5 rounded-xl border border-primary/10 bg-white/80 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground/45">
                      Activity Feed
                    </p>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </span>
                      LIVE
                    </span>
                  </div>
                  <ul className="divide-y divide-foreground/5 text-sm">
                    {ticker.map((t, i) => (
                      <li key={i} className="flex items-center gap-2 py-2">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            t.kind === "alert" ? "bg-red-500" : "bg-primary"
                          }`}
                        />
                        <span className="truncate text-xs font-medium text-foreground">
                          {t.label}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-[10px] text-foreground/50">
                          {t.sub}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Primary action */}
                <Link
                  href="/admin"
                  className="group relative flex items-center gap-4 overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-primary to-[oklch(0.48_0.22_330)] px-5 py-4 text-left shadow-xl shadow-primary/30 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.985]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
                      admin action
                    </p>
                    <p className="text-lg font-black leading-tight text-white">Open Dashboard</p>
                  </div>
                  <ArrowRight className="relative h-5 w-5 shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5" />
                </Link>

                {/* Panel footer */}
                <div className="mt-4 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-foreground/40">
                  <span>endpoint · /api/admin</span>
                  <span>next refresh · 15s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function MetaBlock({
  icon: Icon,
  label,
  value,
  hint,
  tint,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint: string;
  tint: "emerald" | "blue" | "violet";
}) {
  const palette = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    violet: "text-violet-600 bg-violet-50",
  }[tint];
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${palette}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
          {label}
        </p>
        <p className="text-lg font-black text-foreground leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] text-foreground/50">{hint}</p>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tint,
  pulse,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  tint: "blue" | "red" | "emerald" | "violet";
  pulse?: boolean;
}) {
  const palette = {
    blue: { bg: "bg-blue-50/60", border: "border-blue-100", icon: "text-blue-500" },
    red: { bg: "bg-red-50/60", border: "border-red-200", icon: "text-red-500" },
    emerald: { bg: "bg-emerald-50/60", border: "border-emerald-100", icon: "text-emerald-500" },
    violet: { bg: "bg-violet-50/60", border: "border-violet-100", icon: "text-violet-500" },
  }[tint];
  return (
    <div className={`rounded-xl border ${palette.border} ${palette.bg} p-3`}>
      <div className="flex items-center justify-between">
        <Icon className={`h-4 w-4 ${palette.icon} ${pulse ? "animate-pulse" : ""}`} />
        {pulse && (
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
        )}
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
        {label}
      </p>
      <p className="text-xl font-black text-foreground leading-none">{value}</p>
    </div>
  );
}

function StatusRing({
  hasEmergency,
  resolveRate,
}: {
  hasEmergency: boolean;
  resolveRate: number;
}) {
  const color = hasEmergency ? "#ef4444" : "#10b981";
  return (
    <div className="relative h-16 w-16 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(${color} ${resolveRate}%, rgba(244,114,182,0.15) 0)`,
        }}
      />
      <div className="absolute inset-1.5 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
        <p className="text-[9px] font-mono uppercase tracking-wider text-foreground/50">
          {hasEmergency ? "Alert" : "OK"}
        </p>
        <p className="text-xs font-black text-foreground leading-none">{resolveRate}%</p>
      </div>
    </div>
  );
}
