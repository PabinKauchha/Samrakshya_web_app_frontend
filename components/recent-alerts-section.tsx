"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  HeartHandshake,
  Siren,
  Users,
  ExternalLink,
  Radio,
} from "lucide-react";

type SOS = {
  _id: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt?: string;
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

function exactTime(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name?: string) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function RecentAlertsSection() {
  const [alerts, setAlerts] = useState<SOS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { setLoading(false); return; }

    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get<{ data: SOS[] }>(`${API}/api/admin/active-sos`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setAlerts(res.data.data ?? []);
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const i = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(i); };
  }, []);

  const [featured, ...queue] = alerts;
  const queuePreview = queue.slice(0, 4);
  const hasEmergency = alerts.length > 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-white to-pink-50 py-16 md:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] ${
                    hasEmergency
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${hasEmergency ? "bg-red-400" : "bg-emerald-400"} opacity-75`} />
                    <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${hasEmergency ? "bg-red-500" : "bg-emerald-500"}`} />
                  </span>
                  {hasEmergency ? "Live Emergency" : "No Active Alerts"}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
                  · queue · {alerts.length}
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
                Active alert <span className="text-primary">queue</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
                Highest-priority emergencies are escalated here first, followed by the incoming
                queue. Auto-refreshes every 10 seconds.
              </p>
            </div>

            <Link
              href="/admin"
              className="group inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Open full dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading ? (
            <LoadingLayout />
          ) : !hasEmergency ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              {/* Featured priority alert */}
              <FeaturedAlert alert={featured} queuePosition={1} />

              {/* Incoming queue */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-primary/10 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-primary" />
                    <p className="text-sm font-bold text-foreground">Incoming Queue</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/50">
                    {queue.length} waiting
                  </span>
                </div>
                {queuePreview.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50">
                      <HeartHandshake className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Queue clear</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No other active alerts waiting.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-primary/10">
                    {queuePreview.map((a, i) => (
                      <QueueItem key={a._id} alert={a} position={i + 2} />
                    ))}
                    {queue.length > queuePreview.length && (
                      <li className="px-5 py-3">
                        <Link
                          href="/admin"
                          className="flex items-center justify-between rounded-xl bg-pink-50 px-3 py-2 text-xs font-semibold text-primary hover:bg-pink-100 transition-colors"
                        >
                          View all {queue.length} in queue
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function FeaturedAlert({ alert, queuePosition }: { alert: SOS; queuePosition: number }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-red-200 bg-gradient-to-br from-red-50 via-rose-50/60 to-white shadow-xl shadow-red-500/10">
      {/* Red corner accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-600 to-red-500" />
      <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        PRIORITY · #{queuePosition}
      </div>

      <div className="p-6 md:p-8">
        {/* User identity */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-500/35">
            <span className="text-xl font-black text-white">{initials(alert.user?.name)}</span>
            <span className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-white">
              <AlertTriangle className="h-3 w-3 text-red-500" />
            </span>
          </div>
          <div className="min-w-0 pr-20">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-600/70">
              Active SOS · requires response
            </p>
            <h3 className="mt-1 truncate text-2xl font-black text-foreground md:text-3xl">
              {alert.user?.name || "Unknown user"}
            </h3>
            {alert.user?.email && (
              <p className="mt-1 truncate text-sm text-muted-foreground">{alert.user.email}</p>
            )}
          </div>
        </div>

        {/* Detail strip */}
        <div className="mb-6 grid gap-3 rounded-2xl border border-red-100 bg-white/80 p-4 sm:grid-cols-3">
          <DetailBlock icon={MapPin} label="Coordinates" value={`${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}`} mono />
          <DetailBlock icon={Clock} label="Triggered" value={relTime(alert.createdAt)} sub={exactTime(alert.createdAt)} />
          <DetailBlock icon={AlertTriangle} label="Status" value={alert.status} badge="red" />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/30 transition-transform hover:-translate-y-0.5"
          >
            <Siren className="h-4 w-4" />
            Respond now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
          >
            <ExternalLink className="h-4 w-4" />
            Open map
          </a>
          <span className="ml-auto hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45 sm:inline-flex">
            <Users className="h-3 w-3" />
            Notified · emergency contacts
          </span>
        </div>
      </div>
    </div>
  );
}

function DetailBlock({
  icon: Icon,
  label,
  value,
  sub,
  mono,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
  badge?: "red";
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p
        className={`mt-1 text-sm font-bold text-foreground ${mono ? "font-mono text-xs" : ""} ${
          badge === "red" ? "inline-flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-foreground/45">{sub}</p>}
    </div>
  );
}

function QueueItem({ alert, position }: { alert: SOS; position: number }) {
  return (
    <li className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-pink-50/50">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary">
        #{position}
      </span>
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-sm">
        <span className="text-[11px] font-black text-white">{initials(alert.user?.name)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">
          {alert.user?.name || "Unknown"}
        </p>
        <p className="truncate font-mono text-[10px] text-foreground/50">
          {alert.latitude.toFixed(3)}, {alert.longitude.toFixed(3)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[10px] uppercase tracking-wider text-foreground/50">
          {relTime(alert.createdAt)}
        </p>
        <a
          href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 hover:underline"
        >
          Map
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </li>
  );
}

function LoadingLayout() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="h-64 animate-pulse rounded-[1.75rem] border border-primary/15 bg-white/80" />
      <div className="h-64 animate-pulse rounded-[1.75rem] border border-primary/15 bg-white/80" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 shadow-sm">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.35) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center px-6 py-14 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 ring-8 ring-emerald-50">
          <HeartHandshake className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-foreground md:text-3xl">
          Queue is <span className="text-emerald-600">clear</span>
        </h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          No active SOS alerts on the platform. The system is actively listening — incoming
          emergencies will surface here instantly.
        </p>
        <div className="mt-6 inline-flex items-center gap-4 rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-mono text-foreground/60">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Monitoring
          </span>
          <span className="h-3 w-px bg-foreground/15" />
          <span>Poll · 10s</span>
          <span className="h-3 w-px bg-foreground/15" />
          <Link href="/admin" className="font-semibold text-emerald-700 hover:underline">
            Open dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
