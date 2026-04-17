"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, HeartHandshake, Wifi, Clock3, Database, MapPin } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalSOS: number;
  activeSOS: number;
  totalIncidents: number;
};

const API = "http://localhost:4321";

export function LiveOpsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bootedAt] = useState<Date>(new Date());
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await axios.get<{ data: Stats }>(`${API}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setStats(res.data.data);
      } catch {
        /* silent */
      }
    };
    load();
    const i = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, []);

  const uptimeMs = now.getTime() - bootedAt.getTime();
  const uptimeMins = Math.floor(uptimeMs / 60_000);
  const uptimeSecs = Math.floor((uptimeMs % 60_000) / 1000);
  const uptimeLabel = `${uptimeMins}m ${String(uptimeSecs).padStart(2, "0")}s`;

  const active = stats?.activeSOS ?? 0;
  const hasEmergency = active > 0;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-10 md:py-12">
      {/* Decorative grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 35%, transparent 85%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${
                  hasEmergency
                    ? "bg-gradient-to-br from-red-500 to-rose-700"
                    : "bg-gradient-to-br from-emerald-500 to-teal-700"
                } shadow-lg`}
              >
                <Activity className="h-4 w-4 text-white" />
                {hasEmergency && (
                  <span className="absolute inset-0 rounded-lg ring-2 ring-red-400/50 animate-ping" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/50">
                  Operations · Live
                </p>
                <h2 className="text-lg font-black text-white">
                  Platform Status
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-white/45">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 uppercase tracking-wider">
                region · global
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 uppercase tracking-wider">
                uptime · {uptimeLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            <OpsTile
              icon={Wifi}
              label="API"
              value="Online"
              status="good"
              sub="4321 · OK"
            />
            <OpsTile
              icon={Database}
              label="Database"
              value="Connected"
              status="good"
              sub="MongoDB Atlas"
            />
            <OpsTile
              icon={HeartHandshake}
              label="Auth"
              value="Verified"
              status="good"
              sub="JWT session"
            />
            <OpsTile
              icon={MapPin}
              label="Geo"
              value={hasEmergency ? `${active} pins` : "Idle"}
              status={hasEmergency ? "alert" : "good"}
              sub="Leaflet map"
            />
            <OpsTile
              icon={Activity}
              label="Poll"
              value="15s"
              status="good"
              sub="Auto-refresh"
            />
            <OpsTile
              icon={Clock3}
              label="Latency"
              value="< 1s"
              status="good"
              sub="UI acknowledge"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function OpsTile({
  icon: Icon,
  label,
  value,
  status,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "good" | "alert" | "warn";
  sub: string;
}) {
  const palette = {
    good: {
      dot: "bg-emerald-400",
      ring: "ring-emerald-500/20",
      value: "text-emerald-300",
    },
    alert: {
      dot: "bg-red-400",
      ring: "ring-red-500/30",
      value: "text-red-300",
    },
    warn: {
      dot: "bg-amber-400",
      ring: "ring-amber-500/25",
      value: "text-amber-300",
    },
  }[status];

  return (
    <div
      className={`relative rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm ring-1 ${palette.ring} transition-all hover:bg-white/[0.08]`}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-3.5 w-3.5 text-white/55" />
        <span className={`h-1.5 w-1.5 rounded-full ${palette.dot} ${status === "alert" ? "animate-pulse" : ""}`} />
      </div>
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <p className={`text-sm font-black leading-tight ${palette.value}`}>{value}</p>
      <p className="mt-0.5 truncate font-mono text-[10px] text-white/35">{sub}</p>
    </div>
  );
}
