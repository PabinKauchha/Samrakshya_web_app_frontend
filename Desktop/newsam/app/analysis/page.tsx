"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartHandshake, Bell, Users, LayoutDashboard, BookOpen,
  FileVideo, MessageCircle, Settings, LogOut, ChevronRight,
  ChevronDown, X, Menu, Phone, Home, Clock, RefreshCw,
  Navigation, Activity, TrendingUp, AlertTriangle, CheckCircle,
  Shield, BarChart2, Zap, Target, Calendar, Award,
  Loader2, MapPin,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, LineChart, Line,
} from "recharts";
import {
  triggerSOS, getSOSHistory, getUserProfile, getIncidents,
  getActiveSOS, cancelSOS, type SOSEvent,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────
function getInitials(value: string) {
  if (!value) return "SA";
  const cleaned = value.split("@")[0];
  const parts = cleaned.split(/[.\s_-]+/).filter(Boolean);
  return (parts[0]?.[0] || cleaned[0] || "S").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}

function relativeTime(iso: string) {
  const d = safeDate(iso);
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── FIXED: Robust date parser that handles ISO, timestamps, space-separated, and Unix seconds ───
function safeDate(val: string | number | undefined | null): Date | null {
  if (val === null || val === undefined || val === "") return null;

  // Numeric — Unix timestamp (seconds or milliseconds)
  if (typeof val === "number") {
    const d = new Date(val < 1e12 ? val * 1000 : val);
    return isNaN(d.getTime()) ? null : d;
  }

  // Try direct ISO parse first
  let d = new Date(val);
  if (!isNaN(d.getTime())) return d;

  // "2024-01-15 14:30:00" → "2024-01-15T14:30:00"
  d = new Date(val.replace(" ", "T"));
  if (!isNaN(d.getTime())) return d;

  // "2024-01-15T14:30:00.000Z" with extra chars — try trimming
  d = new Date(val.trim());
  if (!isNaN(d.getTime())) return d;

  console.warn("safeDate: could not parse →", val);
  return null;
}

// ─── FIXED: Tries multiple field names for the event date ───
function getEventDate(e: any): Date | null {
  return (
    safeDate(e.time) ??
    safeDate(e.createdAt) ??
    safeDate(e.timestamp) ??
    safeDate(e.created_at) ??
    safeDate(e.date) ??
    null
  );
}

// Build last 30 days with zeros then fill real data
function buildDailyTrend(events: any[], days = 30) {
  const map: Record<string, { total: number; resolved: number; active: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { total: 0, resolved: 0, active: 0 };
  }

  let matched = 0;
  let skipped = 0;

  events.forEach(e => {
    const d = getEventDate(e);
    if (!d) {
      skipped++;
      console.warn("buildDailyTrend: unparseable date on event", e);
      return;
    }
    const key = d.toISOString().slice(0, 10);
    if (map[key]) {
      map[key].total++;
      matched++;
      if (e.status === "confirmed" || e.status === "resolved") map[key].resolved++;
      else map[key].active++;
    } else {
      skipped++;
      console.warn("buildDailyTrend: event outside 30d window, date =", key, e);
    }
  });

  console.log(`buildDailyTrend: ${matched} matched, ${skipped} skipped out of ${events.length} events`);
  return Object.entries(map).map(([date, v]) => ({ date, label: fmt(date), ...v }));
}

function buildHourlyDistribution(events: any[]) {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: i === 0 ? "12am" : i < 12 ? `${i}am` : i === 12 ? "12pm" : `${i - 12}pm`,
    count: 0,
  }));
  events.forEach(e => {
    const d = getEventDate(e);
    if (!d) return;
    hours[d.getHours()].count++;
  });
  return hours;
}

function buildMonthlyTrend(events: any[]) {
  const map: Record<string, number> = {};
  events.forEach(e => {
    const d = getEventDate(e);
    if (!d) return;
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).slice(-6).map(([label, count]) => ({ label, count }));
}

// Safety score 0-100 based on resolution rate + recency + contacts
function calcSafetyScore(resolved: number, total: number, contacts: number, last7: number) {
  if (total === 0 && contacts >= 3) return 95;
  const resRate = total > 0 ? (resolved / total) * 40 : 40;
  const contactScore = Math.min(contacts * 10, 30);
  const recencyPenalty = Math.min(last7 * 5, 20);
  return Math.max(10, Math.min(100, Math.round(resRate + contactScore + 30 - recencyPenalty)));
}

// ─── FIXED: Unwrap API response — handles { data: [...] }, { data: { events: [...] } }, or plain array ───
function unwrapArray(res: any): any[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.events)) return res.data.events;
  if (Array.isArray(res.data?.history)) return res.data.history;
  if (Array.isArray(res.events)) return res.events;
  if (Array.isArray(res.history)) return res.history;
  // last resort — look for any array value
  for (const v of Object.values(res)) {
    if (Array.isArray(v) && (v as any[]).length > 0) return v as any[];
  }
  console.warn("unwrapArray: could not find array in response", res);
  return [];
}

// Custom tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-xs min-w-[120px]">
      <p className="font-bold text-slate-600 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold flex items-center justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-slate-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
export default function AnalysisPage() {
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [email, setEmail]               = useState("");
  const [contacts, setContacts]         = useState<any[]>([]);
  const [history, setHistory]           = useState<any[]>([]);
  const [incidents, setIncidents]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [now, setNow]                   = useState(new Date());
  const [activeSosId, setActiveSosId]   = useState<string | null>(null);
  const [triggerLoading, setTriggerLoading] = useState(false);

  // ── Derived stats ──
  const totalSOS     = history.length;
  const activeSOS    = history.filter(e => e.status === "active").length;
  const resolvedSOS  = history.filter(e => e.status === "confirmed" || e.status === "resolved").length;
  const contactCount = contacts.length;
  const incidentCount = incidents.length;

  const last7 = history.filter(e => {
    const d = getEventDate(e);
    return d ? Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000 : false;
  }).length;

  const last30 = history.filter(e => {
    const d = getEventDate(e);
    return d ? Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000 : false;
  }).length;

  const resolutionRate = totalSOS > 0 ? Math.round((resolvedSOS / totalSOS) * 100) : 0;
  const safetyScore = calcSafetyScore(resolvedSOS, totalSOS, contactCount, last7);

  const lastSOS = history.length > 0
    ? history.reduce<Date | null>((max, e) => {
        const d = getEventDate(e);
        if (!d) return max;
        return !max || d > max ? d : max;
      }, null)
    : null;
  const safetyStreak = lastSOS
    ? Math.floor((Date.now() - lastSOS.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Chart data
  const dailyTrend  = buildDailyTrend(history, 30);
  const hourlyData  = buildHourlyDistribution(history);
  const monthlyData = buildMonthlyTrend(history);

  const peakHour = hourlyData.reduce((a, b) => b.count > a.count ? b : a, hourlyData[0]);

  const statusPie = [
    { name: "Resolved", value: resolvedSOS, color: "#10b981" },
    { name: "Active",   value: activeSOS,   color: "#ef4444" },
  ].filter(d => d.value > 0);

  const safetyGauge = [{ name: "Score", value: safetyScore, fill: safetyScore >= 80 ? "#10b981" : safetyScore >= 50 ? "#f59e0b" : "#ef4444" }];

  const userInitials = getInitials(email);

  // ── FIXED: Load data with proper unwrapping and logging ──
  async function loadAll() {
    setLoading(true);
    try {
      const profileRes = await getUserProfile();
      const userEmail = profileRes.data.user.email;
      setEmail(userEmail);
      setContacts(profileRes.data.user.emergencyContacts ?? []);

      const [histRaw, incRaw] = await Promise.all([
        getSOSHistory(),
        getIncidents(userEmail),
      ]);

      console.log("Raw getSOSHistory() response:", histRaw);
      console.log("Raw getIncidents() response:", incRaw);

      const histArray = unwrapArray(histRaw);
      const incArray  = unwrapArray(incRaw);

      console.log("Parsed history array length:", histArray.length);
      console.log("Sample event:", histArray[0]);

      setHistory(histArray);
      setIncidents(incArray);
   } catch (err) {
  console.error("Profile error:", err);
      } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }
    loadAll();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── FIXED: Real-time polling every 10s with proper unwrapping ──
  useEffect(() => {
    let cancelled = false;

    async function silentRefresh() {
      try {
        const profileRes = await getUserProfile();
        if (cancelled) return;
        const userEmail = profileRes.data.user.email;

        const [histRaw, incRaw] = await Promise.all([
          getSOSHistory(),
          getIncidents(userEmail),
        ]);
        if (cancelled) return;

        const histArray = unwrapArray(histRaw);
        const incArray  = unwrapArray(incRaw);

        console.log("Silent refresh — history count:", histArray.length);

        setHistory(histArray);
        setContacts(profileRes.data.user.emergencyContacts ?? []);
        setIncidents(incArray);
      } catch (err) {
        console.error("Silent refresh failed:", err);
      }
    }

    const id = setInterval(silentRefresh, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onEsc); };
  }, [profileOpen]);

  const handleQuickSOS = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
    setTriggerLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { triggerSOS: trigger } = await import("@/lib/api");
          const res = await trigger(pos.coords.latitude, pos.coords.longitude);
          const sosId = res.data?.sosId;
          if (sosId) {
            localStorage.setItem("activeSosId", sosId);
            setActiveSosId(sosId);
          }
          toast.success("SOS alert sent!");
          router.push("/dashboard");
        } catch (err: any) {
          toast.error(err.message || "Failed to trigger SOS.");
        } finally { setTriggerLoading(false); }
      },
      () => { toast.error("Location access denied."); setTriggerLoading(false); },
      { timeout: 10000 }
    );
  }, [router]);

  function handleSignOut() { localStorage.clear(); router.push("/"); }

  type NavItem = {
    icon: React.ElementType; label: string; active?: boolean;
  } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never });

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Bell,            label: "SOS",       onClick: handleQuickSOS },
    { icon: Users,           label: "Contacts",  href: "/dashboard" },
    { icon: FileVideo,       label: "Reports",   href: "/report" },
    { icon: MessageCircle,   label: "Problems",  href: "/problems" },
    { icon: BookOpen,        label: "Resources", href: "/resources" },
    { icon: BarChart2,       label: "Analysis",  href: "/analysis", active: true },
  ];

  // Score color
  const scoreColor = safetyScore >= 80 ? "#10b981" : safetyScore >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = safetyScore >= 80 ? "Excellent" : safetyScore >= 50 ? "Moderate" : "Needs Attention";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(245,247,255,1)_46%,rgba(248,250,252,1)_100%)] flex">

      {/* ── Sidebar ── */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-64 flex flex-col
          bg-card border-r border-border shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.48_0.22_330)] flex items-center justify-center shadow-md">
                <HeartHandshake className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-foreground text-base tracking-tight">Samrakshya</span>
            </Link>
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-border shrink-0">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-700">Status: Safe</p>
                  <p className="text-[10px] text-emerald-600/70 truncate">{email || "—"}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[11px] text-emerald-700/80">
                {contactCount} trusted contact{contactCount === 1 ? "" : "s"} connected
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ icon: Icon, label, href, onClick, active }) => {
              const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`;
              const inner = (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "group-hover:text-foreground"}`} />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
                </>
              );
              return href ? (
                <Link key={label} href={href} className={cls}>{inner}</Link>
              ) : (
                <button key={label} type="button" onClick={onClick} className={cls}>{inner}</button>
              );
            })}

            <div>
              <button type="button" onClick={() => setSettingsOpen(v => !v)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                  settingsOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Settings className="w-4 h-4 shrink-0 group-hover:text-foreground" />
                Settings
                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`} />
              </button>
              {settingsOpen && (
                <div className="mt-1 ml-3 pl-4 border-l-2 border-border space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-[11px] font-bold text-white shrink-0">
                      {userInitials}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email || "—"}</p>
                  </div>
                  <button type="button" onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
                    <LogOut className="w-4 h-4 shrink-0" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="px-4 pb-4 shrink-0">
            <button onClick={handleQuickSOS} disabled={triggerLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
              {triggerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {triggerLoading ? "Sending…" : "Quick SOS"}
            </button>
          </div>
        </aside>
      </>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 border-b backdrop-blur-xl backdrop-saturate-150 shrink-0 border-rose-200/60 bg-[rgba(253,232,240,0.75)] shadow-[0_10px_30px_-12px_rgba(173,20,87,0.18)]">
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(900px 100px at 10% -30%, rgba(216,27,96,0.07), transparent 60%), radial-gradient(700px 80px at 90% -20%, rgba(173,20,87,0.06), transparent 60%)" }} />

          <div className="relative flex h-[60px] items-center gap-3 px-4 sm:px-6">
            <button className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-[10px] text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
              onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex flex-col leading-tight">
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-[#AD1457]">
                  <Home className="w-3 h-3" /><span>Home</span>
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link href="/dashboard" className="hover:text-[#AD1457] transition-colors">Dashboard</Link>
                <ChevronRight className="w-3 h-3" />
                <span style={{ color: "#AD1457" }}>Analysis</span>
              </nav>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">My Safety Analysis</h2>
                <span className="hidden md:inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider border-emerald-200 bg-emerald-50 text-emerald-700">
                  <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Safe
                </span>
              </div>
            </div>

            <div className="flex-1" />

            <div className="hidden md:flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white/70 px-2 py-1 font-mono text-[10.5px] tracking-[0.1em] text-slate-600">
              <Clock className="w-3 h-3" />
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            <button type="button" onClick={loadAll} disabled={loading}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/25 hover:text-[#AD1457] disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Link href="/report"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-[10px] border-2 border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/30 hover:text-[#AD1457]">
              <FileVideo className="w-3.5 h-3.5" /> Report
            </Link>

            <button type="button" onClick={handleQuickSOS} disabled={triggerLoading}
              className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-[10px] px-3 text-[12.5px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 55%, #7f1d1d 100%)", boxShadow: "0 8px 22px -8px rgba(185,28,28,0.6)" }}>
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {triggerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{triggerLoading ? "Sending" : "SOS"}</span>
              </span>
              <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>

            <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent" />

            <div className="relative" ref={profileRef}>
              <button type="button" aria-haspopup="menu" aria-expanded={profileOpen}
                onClick={() => setProfileOpen(v => !v)}
                className="flex h-9 items-center gap-2 rounded-[10px] border-2 border-slate-200 bg-white pl-1 pr-2 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none">
                <span className="relative flex h-7 w-7 items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)", boxShadow: "0 4px 12px -4px rgba(173,20,87,0.5)" }}>
                  {userInitials}
                  <span aria-hidden className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white bg-emerald-500" />
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div role="menu" className="absolute right-0 top-full z-[60] mt-2 w-72 overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-[0_20px_50px_-12px_rgba(173,20,87,0.25)]">
                  <div className="flex items-center gap-3 px-3 py-3 text-white"
                    style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 55%, #880E4F 100%)" }}>
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 text-[13px] font-bold backdrop-blur-sm">{userInitials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Signed in as</p>
                      <p className="truncate text-[13px] font-semibold">{email || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 border-b border-slate-100 px-2 py-2">
                    {[
                      { label: "SOS", value: totalSOS, color: "rose" },
                      { label: "Resolved", value: resolvedSOS, color: "emerald" },
                      { label: "Reports", value: incidentCount, color: "violet" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-[8px] bg-${color}-50 px-2 py-1.5 text-center`}>
                        <p className={`text-[9px] font-bold uppercase tracking-wider text-${color}-700`}>{label}</p>
                        <p className={`text-[14px] font-black text-${color}-800`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-1.5">
                    <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <Home className="w-4 h-4" /> Home
                    </Link>
                    <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/report" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <FileVideo className="w-4 h-4" /> Report Incident
                    </Link>
                    <Link href="/problems" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <MessageCircle className="w-4 h-4" /> Share a Problem
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button type="button" onClick={() => { setProfileOpen(false); handleSignOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Context strip */}
          <div className="relative hidden md:block border-t border-rose-100/60 bg-gradient-to-r from-rose-50/40 via-white/40 to-rose-50/40">
            <div className="flex h-9 items-center justify-between gap-4 px-4 sm:px-6 text-[11px] font-semibold">
              <div className="flex items-center gap-2.5 overflow-hidden text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Activity className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{totalSOS} total SOS events</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <TrendingUp className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{resolutionRate}% resolution rate</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Shield className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">Safety score {safetyScore}/100</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <span className="hidden lg:inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-700 tracking-wider">connected</span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  <span className="font-mono tracking-wider">sync {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <a href="tel:100" className="hidden xl:inline-flex items-center gap-1 font-bold text-red-700 transition-colors hover:text-red-800">
                  <Phone className="w-3 h-3" /> Police · 100
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <main className="flex-1 px-4 sm:px-6 pt-4 pb-8 space-y-5 overflow-y-auto">

          {/* ── Hero panel ── */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 px-6 py-7 text-white shadow-2xl md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,27,96,0.25),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_28%)]" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Personal safety dashboard
                </div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  Your safety at a glance.
                </h1>
                <p className="mt-2 text-sm leading-7 text-white/60 max-w-lg">
                  Real-time analysis of your SOS activity, resolution patterns, peak risk hours, and overall safety readiness — all built from your personal data.
                </p>
              </div>

              {/* Safety score ring */}
              <div className="flex items-center gap-5 shrink-0">
                <div className="relative w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%"
                      data={safetyGauge} startAngle={90} endAngle={-270} barSize={8}>
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "rgba(255,255,255,0.05)" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{loading ? "—" : safetyScore}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">/ 100</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">Safety score</p>
                  <p className="text-lg font-black" style={{ color: scoreColor }}>{scoreLabel}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {safetyStreak !== null ? `${safetyStreak}d since last SOS` : "No SOS events yet"}
                  </p>
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {contactCount >= 3 && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5 font-semibold">✓ Contacts ready</span>}
                    {resolutionRate >= 80 && <span className="text-[10px] bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5 font-semibold">✓ High resolution</span>}
                    {last7 === 0 && <span className="text-[10px] bg-purple-500/20 text-purple-300 rounded-full px-2 py-0.5 font-semibold">✓ Safe this week</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Top stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total SOS",       value: totalSOS,       icon: Activity,      gradient: "from-primary to-[oklch(0.48_0.22_330)]", iconBg: "bg-primary/10",  iconColor: "text-primary" },
              { label: "Active",          value: activeSOS,      icon: AlertTriangle, gradient: "from-red-500 to-rose-600",                iconBg: "bg-red-50",      iconColor: "text-red-500" },
              { label: "Resolved",        value: resolvedSOS,    icon: CheckCircle,   gradient: "from-emerald-500 to-teal-600",            iconBg: "bg-emerald-50",  iconColor: "text-emerald-600" },
              { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, gradient: "from-blue-500 to-cyan-500",           iconBg: "bg-blue-50",     iconColor: "text-blue-500" },
              { label: "This Week",       value: last7,          icon: Calendar,      gradient: "from-violet-500 to-purple-600",           iconBg: "bg-violet-50",   iconColor: "text-violet-500" },
              { label: "Contacts",        value: contactCount,   icon: Users,         gradient: "from-fuchsia-500 to-pink-600",            iconBg: "bg-fuchsia-50",  iconColor: "text-fuchsia-500" },
            ].map(({ label, value, icon: Icon, gradient, iconBg, iconColor }) => (
              <Card key={label} className="border border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  {loading
                    ? <div className="h-7 w-12 bg-slate-100 rounded-lg animate-pulse mb-1" />
                    : <p className={`text-2xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none`}>{value}</p>
                  }
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── SOS trend (30 days) + Status breakdown ── */}
          <div className="grid gap-4 xl:grid-cols-[1.6fr_0.4fr]">

            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">SOS Activity — Last 30 Days</CardTitle>
                      <CardDescription className="text-[11px]">Daily breakdown of alerts and resolutions</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> Total</span>
                    <span className="flex items-center gap-1 text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Resolved</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
                ) : totalSOS === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center gap-2">
                    <Activity className="w-8 h-8 text-slate-200" />
                    <p className="text-sm font-semibold text-slate-400">No SOS events yet</p>
                    <p className="text-xs text-slate-300">Activity will appear here once you trigger an alert</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dailyTrend} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D81B60" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#D81B60" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false}
                        interval={Math.floor(dailyTrend.length / 6)} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="total" name="Total" stroke="#D81B60" strokeWidth={2}
                        fill="url(#gradTotal)" dot={false} activeDot={{ r: 4, fill: "#D81B60" }} />
                      <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2}
                        fill="url(#gradResolved)" dot={false} activeDot={{ r: 4, fill: "#10b981" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Status Split</CardTitle>
                    <CardDescription className="text-[11px]">Resolved vs active</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
                ) : statusPie.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
                    <Shield className="w-8 h-8 text-slate-200" />
                    <p className="text-xs font-semibold text-slate-400">No data yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={statusPie} cx="50%" cy="50%" innerRadius={45} outerRadius={68}
                          paddingAngle={3} dataKey="value">
                          {statusPie.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any, name: any) => [`${val} events`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-1.5">
                      {statusPie.map(d => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                            {d.name}
                          </span>
                          <span className="font-bold text-slate-900">{d.value}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Resolution rate</span>
                        <span className="font-black" style={{ color: "#D81B60" }}>{resolutionRate}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Peak hours + Monthly trend ── */}
          <div className="grid gap-4 xl:grid-cols-2">

            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Peak Alert Hours</CardTitle>
                      <CardDescription className="text-[11px]">When your SOS alerts happen most</CardDescription>
                    </div>
                  </div>
                  {totalSOS > 0 && (
                    <span className="text-[11px] bg-amber-50 text-amber-700 font-semibold px-2 py-1 rounded-full border border-amber-100">
                      Peak: {peakHour.label}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
                ) : totalSOS === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
                    <Zap className="w-8 h-8 text-slate-200" />
                    <p className="text-xs font-semibold text-slate-400">No hourly data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData.filter((_, i) => i % 2 === 0)} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="count" name="Alerts" radius={[4, 4, 0, 0]}>
                        {hourlyData.filter((_, i) => i % 2 === 0).map((entry, i) => (
                          <Cell key={i}
                            fill={entry.count === peakHour.count && peakHour.count > 0 ? "#D81B60" : "#fce7f3"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Monthly Trend</CardTitle>
                    <CardDescription className="text-[11px]">SOS events per month over time</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-48 bg-slate-50 rounded-xl animate-pulse" />
                ) : monthlyData.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center gap-2 text-center">
                    <Calendar className="w-8 h-8 text-slate-200" />
                    <p className="text-xs font-semibold text-slate-400">No monthly data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D81B60" />
                          <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="count" name="Events" stroke="#D81B60" strokeWidth={2.5}
                        dot={{ r: 4, fill: "#D81B60", stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#D81B60" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Readiness panel + Recent SOS ── */}
          <div className="grid gap-4 xl:grid-cols-[0.4fr_1fr]">

            {/* Safety readiness */}
            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Readiness Check</CardTitle>
                    <CardDescription className="text-[11px]">How prepared you are</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: "Emergency contacts",
                    pass: contactCount >= 3,
                    detail: contactCount >= 3 ? `${contactCount} contacts added` : `Add ${3 - contactCount} more`,
                    icon: Users,
                  },
                  {
                    label: "Safe this week",
                    pass: last7 === 0,
                    detail: last7 === 0 ? "No alerts this week" : `${last7} alert${last7 > 1 ? "s" : ""} this week`,
                    icon: Shield,
                  },
                  {
                    label: "Resolution rate",
                    pass: resolutionRate >= 80 || totalSOS === 0,
                    detail: totalSOS === 0 ? "No events yet" : `${resolutionRate}% resolved`,
                    icon: TrendingUp,
                  },
                  {
                    label: "Incident reports",
                    pass: incidentCount === 0,
                    detail: incidentCount === 0 ? "No incidents filed" : `${incidentCount} filed`,
                    icon: FileVideo,
                  },
                ].map(({ label, pass, detail, icon: Icon }) => (
                  <div key={label} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    pass ? "bg-emerald-50/60 border-emerald-100" : "bg-amber-50/60 border-amber-100"
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      pass ? "bg-emerald-100" : "bg-amber-100"
                    }`}>
                      <Icon className={`w-3.5 h-3.5 ${pass ? "text-emerald-700" : "text-amber-700"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${pass ? "text-emerald-800" : "text-amber-800"}`}>{label}</p>
                      <p className={`text-[10px] ${pass ? "text-emerald-600" : "text-amber-600"}`}>{detail}</p>
                    </div>
                    <span className={`text-[10px] font-bold ml-auto shrink-0 ${pass ? "text-emerald-600" : "text-amber-600"}`}>
                      {pass ? "✓" : "!"}
                    </span>
                  </div>
                ))}

                {/* Score bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-1.5">
                    <span>Overall score</span>
                    <span style={{ color: scoreColor }}>{safetyScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${safetyScore}%`, background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent SOS table */}
            <Card className="border border-border/60">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">Recent SOS Events</CardTitle>
                      <CardDescription className="text-[11px]">Your last {Math.min(history.length, 8)} alerts</CardDescription>
                    </div>
                  </div>
                  {activeSOS > 0 && (
                    <Badge variant="destructive" className="rounded-full animate-pulse text-[10px]">{activeSOS} active</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}</div>
                ) : history.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-sm font-semibold text-slate-400">No SOS events yet</p>
                    <p className="text-xs text-slate-300">Triggered alerts will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[420px]">
                      <thead>
                        <tr className="border-b border-border">
                          {["Status", "Location", "Time", "Duration"].map(h => (
                            <th key={h} className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-2 pr-4 first:pl-0">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {history.slice(0, 8).map((event, idx) => {
                          const eventDate = getEventDate(event);
                          const confirmedDate = safeDate(event.confirmedAt ?? event.resolvedAt);
                          const duration = (event.status === "confirmed" || event.status === "resolved") && confirmedDate && eventDate
                            ? Math.round((confirmedDate.getTime() - eventDate.getTime()) / 60000)
                            : null;
                          return (
                            <tr key={event._id ?? idx} className="hover:bg-secondary/30 transition-colors">
                              <td className="py-2.5 pr-4">
                                <Badge variant={event.status === "active" ? "destructive" : "secondary"}
                                  className={`rounded-full text-[10px] ${event.status === "active" ? "animate-pulse" : ""}`}>
                                  {event.status}
                                </Badge>
                              </td>
                              <td className="py-2.5 pr-4">
                                {event.locationLink ? (
                                  <a href={event.locationLink} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    {Number(event.latitude).toFixed(3)}, {Number(event.longitude).toFixed(3)}
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    {event.latitude != null ? `${Number(event.latitude).toFixed(3)}, ${Number(event.longitude).toFixed(3)}` : "—"}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                                {eventDate ? relativeTime(event.time ?? event.createdAt ?? event.timestamp) : "—"}
                              </td>
                              <td className="py-2.5 text-xs text-muted-foreground">
                                {duration !== null ? `${duration}m` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
}