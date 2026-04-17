"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import {
  Inbox,
  Search,
  Send,
  HeartHandshake,
  MessageSquare,
  CheckCircle2,
  Clock,
  Loader2,
  Filter,
  Mail,
  Hash,
  RefreshCw,
  Flame,
  ArrowUpRight,
  Eye,
  LayoutDashboard,
  AlertTriangle,
  LogOut,
  Globe,
  Activity,
  TrendingUp,
  ChevronRight,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/auth-provider";
import {
  addReply,
  CATEGORY_META,
  listAllProblems,
  Problem,
  ProblemStatus,
  STATUS_META,
  subscribeProblems,
  summarise,
  updateStatus,
} from "@/lib/problems-service";

const ROSE = "#D81B60";
const ROSE_DARK = "#AD1457";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// ── Priority derivation (category-based since Problem has no priority field)
type Priority = "high" | "medium" | "low";
function derivePriority(p: Problem): Priority {
  if (p.category === "safety") return "high";
  if (p.category === "bug" || p.category === "account") return "medium";
  if (p.status === "pending") return "medium";
  return "low";
}

const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; dot: string }
> = {
  high: {
    label: "High",
    chip: "bg-rose-50 text-[#AD1457] border-rose-200",
    dot: "bg-[#D81B60]",
  },
  medium: {
    label: "Medium",
    chip: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low",
    chip: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

const STATUS_TABS: { value: "all" | ProblemStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_review", label: "In Review" },
  { value: "resolved", label: "Resolved" },
];

// ── Build a 7-day daily bucket series from problem.createdAt ─────────────────
function buildSeries(
  problems: Problem[],
  match: (p: Problem) => boolean
): number[] {
  const buckets = Array(7).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();
  problems.forEach((p) => {
    if (!match(p)) return;
    const t = new Date(p.createdAt);
    if (Number.isNaN(t.getTime())) return;
    t.setHours(0, 0, 0, 0);
    const daysAgo = Math.round((todayMs - t.getTime()) / 86_400_000);
    if (daysAgo >= 0 && daysAgo < 7) buckets[6 - daysAgo]++;
  });
  return buckets;
}

export default function AdminProblemsPage() {
  const router = useRouter();
  const { email, isAuthenticated, isAdmin, clearAuthSession } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProblemStatus>("all");

  // ── Admin gate ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin/problems");
    } else if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  // ── Load + subscribe ──────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    const all = await listAllProblems();
    setProblems(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh();
    const unsub = subscribeProblems(refresh);
    return unsub;
  }, [refresh]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return problems.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.userEmail.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });
  }, [problems, search, statusFilter]);

  const selected = useMemo(
    () => problems.find((p) => p.id === selectedId) ?? null,
    [problems, selectedId]
  );

  const summary = useMemo(() => summarise(problems), [problems]);

  const highCount = useMemo(
    () => problems.filter((p) => derivePriority(p) === "high").length,
    [problems]
  );

  const series = useMemo(
    () => ({
      total: buildSeries(problems, () => true),
      pending: buildSeries(problems, (p) => p.status === "pending"),
      inReview: buildSeries(problems, (p) => p.status === "in_review"),
      resolved: buildSeries(problems, (p) => p.status === "resolved"),
    }),
    [problems]
  );

  // Signal: how many created this week (last 7 days) — used as the "change" for Total
  const createdThisWeek = useMemo(
    () => series.total.reduce((a, b) => a + b, 0),
    [series.total]
  );

  // Percent-of-total for the non-total cards
  const pct = (n: number) =>
    summary.total > 0 ? Math.round((n / summary.total) * 100) : 0;

  const initials = (() => {
    if (!email) return "AD";
    const local = email.split("@")[0] || "";
    const parts = local.split(/[.\-_]/).filter(Boolean);
    return `${parts[0]?.[0] || local[0] || "A"}${
      parts[1]?.[0] || parts[0]?.[1] || "D"
    }`.toUpperCase();
  })();

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className={inter.className}>
      {/* Sidebar is provided by /app/admin/layout.tsx */}
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-[1440px] p-5">
          {/* ── Page title row ─────────────────────────────────────────── */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <nav
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"
                aria-label="Breadcrumb"
              >
                <Link href="/admin" className="hover:text-[#AD1457]">
                  Admin
                </Link>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <span className="text-slate-700">Problem Reports</span>
              </nav>
              <div className="mt-1 flex items-center gap-2">
                <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-slate-900">
                  Problem Reports
                </h1>
                <span
                  className="rounded-[5px] border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    borderColor: `${ROSE_DARK}35`,
                    color: ROSE_DARK,
                    background: `${ROSE}10`,
                  }}
                >
                  Live
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-slate-500">
                Triage user submissions, reply, and update resolution status.
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh reports"
              className="group inline-flex h-9 items-center gap-2 rounded-[8px] border-[1.5px] border-[#D81B60]/40 bg-white px-3.5 text-[12.5px] font-semibold text-[#D81B60] shadow-sm transition-all hover:border-[#D81B60]/70 hover:bg-rose-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#D81B60] transition-transform duration-500 group-hover:rotate-180 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>

          {/* ── Dense horizontal Stats Bar ─────────────────────────────── */}
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total"
              value={summary.total}
              sub={
                <SubDelta
                  text={`${createdThisWeek} this week`}
                  positive={createdThisWeek > 0}
                />
              }
              Icon={Inbox}
              tone="pink"
              series={series.total}
            />
            <StatCard
              label="Pending"
              value={summary.pending}
              sub={<SubPct value={pct(summary.pending)} label="of total" />}
              Icon={Clock}
              tone="orange"
              series={series.pending}
            />
            <StatCard
              label="In Review"
              value={summary.inReview}
              sub={<SubPct value={pct(summary.inReview)} label="of total" />}
              Icon={Eye}
              tone="blue"
              series={series.inReview}
            />
            <StatCard
              label="Resolved"
              value={summary.resolved}
              sub={<SubPct value={pct(summary.resolved)} label="of total" />}
              Icon={CheckCircle2}
              tone="green"
              series={series.resolved}
            />
          </div>

          {/* ── Compact filter/search bar ──────────────────────────────── */}
          <div className="mb-3 flex flex-col gap-2 rounded-[10px] border border-[#E2E8F0] bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, description, user email, or ID"
                className="h-8 w-full rounded-[7px] border border-[#E2E8F0] bg-white pl-8 pr-3 text-[12.5px] outline-none transition-colors placeholder:text-slate-400 focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
              />
            </div>
            <div className="flex items-center gap-1 rounded-[8px] bg-slate-100 p-0.5">
              <Filter className="ml-1.5 h-3 w-3 text-slate-500" />
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className={`rounded-[6px] px-2 py-1 text-[10.5px] font-semibold transition-all ${
                    statusFilter === tab.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Master-Detail split: 30% Queue / 70% Work Area ─────────── */}
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,3fr)_minmax(0,7fr)]">
            {/* ── Queue (30%) ─────────────────────────────────────────── */}
            <aside className="flex flex-col rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] px-3 py-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Queue
                  </p>
                  {highCount > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#AD1457]">
                      <Flame className="h-2.5 w-2.5" />
                      {highCount}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-bold text-slate-700">
                  {filtered.length}
                </span>
              </div>
              {loading ? (
                <AdminSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyQueue />
              ) : (
                <ul className="max-h-[calc(100vh-300px)] min-h-[420px] flex-1 divide-y divide-[#E2E8F0] overflow-y-auto">
                  {filtered.map((p) => {
                    const priority = derivePriority(p);
                    const isSelected = selectedId === p.id;
                    return (
                      <li key={p.id} className="relative">
                        {priority === "high" && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute inset-y-1.5 left-0 w-[3px] rounded-r-full"
                            style={{
                              background: `linear-gradient(180deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
                              boxShadow: `0 0 10px ${ROSE}66`,
                            }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedId(p.id)}
                          aria-pressed={isSelected}
                          className={`group flex w-full flex-col gap-1 px-3 py-2.5 text-left transition-colors ${
                            isSelected
                              ? "bg-rose-50/70"
                              : "hover:bg-slate-50"
                          } ${priority === "high" ? "pl-4" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <PriorityChip priority={priority} />
                            <span className="shrink-0 font-mono text-[10px] text-slate-400">
                              {relativeTime(p.updatedAt)}
                            </span>
                          </div>

                          <p className="line-clamp-1 text-[12.5px] font-semibold leading-snug text-slate-900">
                            {p.title}
                          </p>

                          <p className="line-clamp-1 text-[11.5px] text-slate-500">
                            {p.description}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-slate-400">
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate">{p.userEmail}</span>
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="rounded-[4px] border border-[#E2E8F0] bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                                {CATEGORY_META[p.category].label}
                              </span>
                              <StatusChip status={p.status} compact />
                            </div>
                          </div>

                          {isSelected && (
                            <span
                              aria-hidden
                              className="pointer-events-none absolute right-2.5 top-2 text-[#D81B60]"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            {/* ── Work area (70%) ─────────────────────────────────────── */}
            <section className="min-h-[580px] rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm">
              {selected ? (
                <AdminDetail
                  problem={selected}
                  adminEmail={email || "admin"}
                  onChange={refresh}
                />
              ) : (
                <AdminPlaceholder />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// STAT CARD (dense, with sparkline + delta)
// ═════════════════════════════════════════════════════════════════════════════
function StatCard({
  label,
  value,
  sub,
  Icon,
  tone,
  series,
}: {
  label: string;
  value: number;
  sub?: React.ReactNode;
  Icon: React.ElementType;
  tone: "pink" | "orange" | "blue" | "green";
  series: number[];
}) {
  const TONE: Record<
    typeof tone,
    {
      bar: string;
      iconBg: string;
      iconFg: string;
      valueFg: string;
      stroke: string;
      fill: string;
    }
  > = {
    pink: {
      bar: "linear-gradient(90deg, #D81B60 0%, #AD1457 100%)",
      iconBg: "bg-rose-50",
      iconFg: "text-[#D81B60]",
      valueFg: "text-[#AD1457]",
      stroke: "#D81B60",
      fill: "rgba(216,27,96,0.12)",
    },
    orange: {
      bar: "linear-gradient(90deg, #fb923c 0%, #f97316 100%)",
      iconBg: "bg-orange-50",
      iconFg: "text-orange-600",
      valueFg: "text-orange-700",
      stroke: "#f97316",
      fill: "rgba(249,115,22,0.12)",
    },
    blue: {
      bar: "linear-gradient(90deg, #60a5fa 0%, #2563eb 100%)",
      iconBg: "bg-sky-50",
      iconFg: "text-sky-600",
      valueFg: "text-sky-700",
      stroke: "#2563eb",
      fill: "rgba(37,99,235,0.12)",
    },
    green: {
      bar: "linear-gradient(90deg, #34d399 0%, #10b981 100%)",
      iconBg: "bg-emerald-50",
      iconFg: "text-emerald-600",
      valueFg: "text-emerald-700",
      stroke: "#10b981",
      fill: "rgba(16,185,129,0.12)",
    },
  };
  const t = TONE[tone];
  return (
    <div className="group relative overflow-hidden rounded-[10px] border border-[#E2E8F0] bg-white px-3 pb-2.5 pt-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: t.bar }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-[5px] ${t.iconBg} ${t.iconFg}`}
            >
              <Icon className="h-3 w-3" strokeWidth={2.4} />
            </div>
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {label}
            </p>
          </div>
          <p
            className={`mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.02em] ${t.valueFg}`}
          >
            {value}
          </p>
          <div className="mt-1 text-[10.5px] font-medium text-slate-500">
            {sub}
          </div>
        </div>
        <Sparkline
          points={series}
          stroke={t.stroke}
          fill={t.fill}
          width={72}
          height={34}
        />
      </div>
    </div>
  );
}

// ── Sparkline (inline SVG) ──────────────────────────────────────────────────
function Sparkline({
  points,
  stroke,
  fill,
  width = 60,
  height = 28,
}: {
  points: number[];
  stroke: string;
  fill: string;
  width?: number;
  height?: number;
}) {
  if (!points.length) {
    return <div style={{ width, height }} />;
  }
  const max = Math.max(...points, 1);
  const n = points.length;
  const step = n > 1 ? width / (n - 1) : width;
  const PAD_Y = 3;
  const usableH = height - PAD_Y * 2;
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - PAD_Y - (p / max) * usableH;
    return [x, y] as const;
  });
  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
  const last = coords[coords.length - 1];
  const first = coords[0];
  const area = `${line} L ${last[0].toFixed(2)} ${height} L ${first[0].toFixed(
    2
  )} ${height} Z`;
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Last-point dot */}
      <circle cx={last[0]} cy={last[1]} r={1.8} fill={stroke} />
    </svg>
  );
}

// ── Sub-label variants ──────────────────────────────────────────────────────
function SubDelta({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        positive ? "text-emerald-600" : "text-slate-500"
      }`}
    >
      <TrendingUp className="h-2.5 w-2.5" />
      <span className="font-semibold">{text}</span>
    </span>
  );
}

function SubPct({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-mono font-bold text-slate-700">{value}%</span>
      <span className="text-slate-500">{label}</span>
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Admin detail (unchanged logic, lightly denser paddings)
// ═════════════════════════════════════════════════════════════════════════════
function AdminDetail({
  problem,
  adminEmail,
  onChange,
}: {
  problem: Problem;
  adminEmail: string;
  onChange: () => Promise<void> | void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState<ProblemStatus | null>(null);

  const onReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;
    setSending(true);
    try {
      await addReply({
        id: problem.id,
        author: "admin",
        authorEmail: adminEmail,
        message: reply,
      });
      setReply("");
      await onChange();
      toast.success("Reply delivered.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  };

  const onStatus = async (next: ProblemStatus) => {
    if (problem.status === next || updating) return;
    setUpdating(next);
    try {
      await updateStatus(problem.id, next);
      await onChange();
      toast.success(`Marked as ${STATUS_META[next].label}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-3 border-b border-[#E2E8F0] p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <StatusChip status={problem.status} />
            <span className="rounded-[5px] border border-[#E2E8F0] bg-slate-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate-600">
              {CATEGORY_META[problem.category].label}
            </span>
            <PriorityChip priority={derivePriority(problem)} />
          </div>
          <h2 className="text-[17px] font-bold leading-tight text-slate-900">
            {problem.title}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[10.5px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {problem.userEmail}
            </span>
            <span className="inline-flex items-center gap-1">
              <Hash className="h-3 w-3 font-mono" />
              <span className="font-mono">{problem.id}</span>
            </span>
            <span>Updated {relativeTime(problem.updatedAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {(["pending", "in_review", "resolved"] as ProblemStatus[]).map((s) => {
            const meta = STATUS_META[s];
            const active = problem.status === s;
            const busy = updating === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatus(s)}
                disabled={busy || active}
                className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2 py-1 text-[10.5px] font-bold uppercase tracking-wider transition-all ${
                  active
                    ? `${meta.chip} ${meta.border} cursor-default`
                    : "border-[#E2E8F0] bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                )}
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-[#E2E8F0] p-4">
        <p className="mb-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-500">
          User report
        </p>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-700">
          {problem.description}
        </p>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
        {problem.replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#E2E8F0] bg-slate-50/60 px-6 py-8 text-center">
            <MessageSquare className="h-5 w-5 text-slate-300" />
            <p className="mt-2 text-[12.5px] font-semibold text-slate-700">
              No messages yet
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Start the conversation by replying below.
            </p>
          </div>
        ) : (
          problem.replies.map((r) => (
            <AdminBubble
              key={r.id}
              author={r.author}
              email={r.authorEmail}
              message={r.message}
              at={r.createdAt}
            />
          ))
        )}
      </div>

      <form
        onSubmit={onReply}
        className="flex flex-col gap-2 border-t border-[#E2E8F0] bg-slate-50/60 p-2.5 sm:flex-row sm:items-start"
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Respond to the user as admin…"
          rows={2}
          className="min-h-[42px] flex-1 resize-none rounded-[8px] border border-[#E2E8F0] bg-white px-2.5 py-1.5 text-[12.5px] outline-none transition-colors placeholder:text-slate-400 focus:border-[#D81B60]/50 focus:ring-2 focus:ring-[#D81B60]/15"
        />
        <button
          type="submit"
          disabled={!reply.trim() || sending}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] px-3.5 text-[12.5px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
            boxShadow: `0 6px 18px -6px ${ROSE_DARK}80`,
          }}
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Send Reply
        </button>
      </form>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Shared primitives
// ═════════════════════════════════════════════════════════════════════════════
function StatusChip({
  status,
  compact = false,
}: {
  status: keyof typeof STATUS_META;
  compact?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 font-bold uppercase tracking-wider ${
        meta.chip
      } ${compact ? "text-[9px]" : "text-[10px]"}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function PriorityChip({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${meta.chip}`}
    >
      {priority === "high" ? (
        <Flame className="h-2.5 w-2.5" />
      ) : (
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      )}
      {meta.label}
    </span>
  );
}

function AdminBubble({
  author,
  email,
  message,
  at,
}: {
  author: "user" | "admin";
  email?: string;
  message: string;
  at: string;
}) {
  const isAdmin = author === "admin";
  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-[10px] px-3 py-2 shadow-sm ${
          isAdmin
            ? "text-white"
            : "border border-[#E2E8F0] bg-white text-slate-800"
        }`}
        style={
          isAdmin
            ? {
                background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              }
            : undefined
        }
      >
        <div
          className={`mb-0.5 flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-wider ${
            isAdmin ? "text-white/85" : "text-slate-500"
          }`}
        >
          {isAdmin && <HeartHandshake className="h-3 w-3" />}
          <span>{isAdmin ? "Admin" : email || "User"}</span>
          <span className={isAdmin ? "text-white/60" : "text-slate-400"}>
            ·
          </span>
          <span className={isAdmin ? "text-white/70" : "text-slate-400"}>
            {relativeTime(at)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-[12.5px] leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-1 p-2.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-[8px] bg-slate-100 p-2.5">
          <div className="mb-2 h-2.5 w-1/2 rounded bg-slate-200" />
          <div className="h-2 w-3/4 rounded bg-slate-200/80" />
        </div>
      ))}
    </div>
  );
}

function EmptyQueue() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-slate-100">
        <Inbox className="h-5 w-5 text-slate-400" />
      </div>
      <p className="text-[12.5px] font-bold text-slate-800">Inbox is clear</p>
      <p className="mt-1 max-w-[220px] text-[11px] text-slate-500">
        No problem reports match your current filter.
      </p>
    </div>
  );
}

function AdminPlaceholder() {
  return (
    <div className="flex h-full min-h-[520px] flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] text-white shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
          boxShadow: `0 12px 28px -10px ${ROSE_DARK}80`,
        }}
      >
        <MessageSquare className="h-6 w-6" />
      </div>
      <p className="text-[14px] font-bold text-slate-900">Select a report</p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        Open a user submission to read the full report, respond, and update its
        status.
      </p>
    </div>
  );
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
