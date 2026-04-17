"use client";

import Link from "next/link";
import {
  Activity,
  FileVideo,
  Users,
  MapPin,
  BarChart3,
  HeartHandshake,
  Terminal,
  ArrowUpRight,
  Zap,
} from "lucide-react";

export function FeaturesSectionAdmin() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-gradient-to-b from-pink-50 via-white to-pink-100 py-20 md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.10),transparent_32%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-primary shadow-sm">
                <Terminal className="h-3 w-3" />
                Admin capabilities
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
                An operations console, <br className="hidden md:block" />
                not a <span className="text-primary line-through decoration-primary/40 decoration-2">brochure</span>{" "}
                dashboard.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted-foreground md:text-base">
              Every tool has a single job — surface what needs attention, remove what doesn&apos;t,
              and keep the response time measured in seconds, not minutes.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-[repeat(3,minmax(0,auto))]">
            {/* ANCHOR: Live monitoring — tall hero card */}
            <AnchorCard />

            {/* Incident Management */}
            <MediumCard
              className="md:col-span-4"
              icon={FileVideo}
              iconTint="violet"
              tag="Management"
              title="Incident Management"
              description="Every reported incident, classified by type, searchable by location or reporter, with admin-only filters and an inline response flow."
              meta="table view · type filter · search"
            />

            {/* User Oversight */}
            <MediumCard
              className="md:col-span-2"
              icon={Users}
              iconTint="blue"
              tag="Oversight"
              title="User Management"
              description="Who's signed up, who's verified, who needs review — in one list."
              meta="verify · disable · audit"
            />

            {/* Real-time tracking */}
            <MediumCard
              className="md:col-span-2"
              icon={MapPin}
              iconTint="rose"
              tag="Geospatial"
              title="Real-time Tracking"
              description="Interactive map that plots active alerts and refreshes on its own."
              meta="leaflet · 10s refresh"
            />

            {/* Analytics */}
            <MediumCard
              className="md:col-span-2"
              icon={BarChart3}
              iconTint="amber"
              tag="Insights"
              title="Operational Analytics"
              description="Platform metrics at a glance — users, SOS volume, active alerts, incidents."
              meta="daily · weekly · rolling"
            />

            {/* Security */}
            <SecurityCard />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Anchor (hero) card — spans 2 columns × 2 rows ─────────────────────────────
function AnchorCard() {
  return (
    <Link
      href="/admin"
      className="group relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/20 transition-all hover:-translate-y-0.5 md:col-span-2 md:row-span-2 md:p-8"
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at top right, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at top right, black 30%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute right-[-60px] top-[-40px] h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-60px] left-[-40px] h-60 w-60 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-500/30">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/40 bg-red-500/15 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-red-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
            </span>
            Priority
          </span>
        </div>

        <h3 className="text-2xl font-black leading-tight md:text-3xl">
          Live SOS Monitoring
        </h3>
        <p className="mt-3 text-sm text-white/65 md:text-base">
          Every active emergency plotted in real time with pulsing indicators, one-click
          response, and a queue that sorts by urgency automatically.
        </p>

        {/* Feature checklist */}
        <ul className="mt-6 space-y-2">
          {[
            "Pulse-animated pins",
            "Auto-refresh every 10 seconds",
            "One-click resolve workflow",
            "User + location + timestamp context",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-xs text-white/75">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm transition-colors group-hover:bg-white/10">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
              /admin · live map
            </span>
            <ArrowUpRight className="h-5 w-5 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Medium bento card ─────────────────────────────────────────────────────────
function MediumCard({
  className,
  icon: Icon,
  iconTint,
  tag,
  title,
  description,
  meta,
}: {
  className?: string;
  icon: React.ElementType;
  iconTint: "blue" | "violet" | "rose" | "amber";
  tag: string;
  title: string;
  description: string;
  meta: string;
}) {
  const palette = {
    blue: "from-blue-500 to-cyan-600 shadow-blue-500/20",
    violet: "from-violet-500 to-purple-600 shadow-violet-500/20",
    rose: "from-rose-500 to-pink-600 shadow-rose-500/20",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/20",
  }[iconTint];

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border border-primary/15 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-fuchsia-500/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${palette} shadow-md`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <span className="rounded-full border border-primary/15 bg-pink-50 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-primary">
            {tag}
          </span>
        </div>

        <h3 className="mb-1.5 text-lg font-black text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground/45">
            {meta}
          </span>
          <ArrowUpRight className="h-4 w-4 text-primary/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}

// ── Security card — distinct emerald treatment, spans 2 cols ──────────────────
function SecurityCard() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/10 md:col-span-2">
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
            <HeartHandshake className="h-5 w-5 text-white" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-700">
            <Zap className="h-3 w-3" />
            Zero-trust
          </span>
        </div>

        <h3 className="mb-1.5 text-lg font-black text-foreground">Role-based Access</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          Admin-only endpoints, JWT-verified sessions, and clear separation from user flows —
          the monitoring tools stay guarded, always.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Auth", value: "JWT" },
            { label: "Role", value: "Admin" },
            { label: "Layer", value: "Middleware" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-emerald-100 bg-white px-2 py-1.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-700/70">
                {m.label}
              </p>
              <p className="text-sm font-black text-foreground leading-none">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
