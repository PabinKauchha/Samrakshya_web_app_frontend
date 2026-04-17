"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  HeartHandshake, Users, AlertTriangle, Activity, RefreshCw, MapPin,
  TrendingUp, FileVideo, LogOut, Menu, X, LayoutDashboard,
  Bell, ChevronRight, Siren,
  CheckCircle, Eye, Settings, ChevronDown,
  Search, UserX, Mail, MailCheck, Calendar,
  MessageCircle, Home, Clock, Radio,
  Wifi, Server, Zap, BarChart3, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { listAllProblems, subscribeProblems } from "@/lib/problems-service";
import { adminResolveSOS } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";

const LeafletMap = dynamic(() => import("./MapComponent"), { ssr: false });

// ── Types ─────────────────────────────────────────────────────────────────────
type ApiResponse<T> = { success: boolean; message: string; data: T };
type Stats = { totalUsers: number; totalSOS: number; activeSOS: number; totalIncidents: number };
type SOS   = {
  _id: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt?: string;
  locationLink?: string;
  user?: { name?: string; email?: string };
};
type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified?: boolean;
  createdAt?: string;
};
type IncidentType =
  | "harassment" | "assault" | "theft" | "stalking"
  | "domestic_violence" | "cyber_crime" | "other" | string;
type Incident = {
  _id: string;
  title: string;
  type: IncidentType;
  customType?: string;
  location?: { latitude: number; longitude: number; address?: string };
  occurredAt?: string;
  createdAt?: string;
  user?: { name?: string; email?: string };
};

const API = "http://localhost:4321";

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(iso?: string) {
  if (!iso) return "—";
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  return `${hours}h ago`;
}

function getInitials(name?: string) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "?";
}

// ── Incident type label + palette ─────────────────────────────────────────────
const INCIDENT_STYLE: Record<string, { label: string; chip: string; dot: string }> = {
  harassment:        { label: "Harassment",        chip: "bg-orange-50 text-orange-700 border-orange-200",   dot: "bg-orange-500" },
  assault:           { label: "Assault",           chip: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500" },
  theft:             { label: "Theft",             chip: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500" },
  stalking:          { label: "Stalking",          chip: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", dot: "bg-fuchsia-500" },
  domestic_violence: { label: "Domestic Violence", chip: "bg-rose-50 text-rose-700 border-rose-200",          dot: "bg-rose-500" },
  cyber_crime:       { label: "Cyber Crime",       chip: "bg-indigo-50 text-indigo-700 border-indigo-200",    dot: "bg-indigo-500" },
  other:             { label: "Other",             chip: "bg-slate-50 text-slate-700 border-slate-200",       dot: "bg-slate-500" },
};

function incidentLabel(i: Incident) {
  if (i.type === "other" && i.customType) return i.customType;
  return INCIDENT_STYLE[i.type]?.label ?? i.type;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,         setStats]        = useState<Stats | null>(null);
  const [sosList,       setSosList]      = useState<SOS[]>([]);
  const [users,         setUsers]        = useState<AdminUser[]>([]);
  const [incidents,     setIncidents]    = useState<Incident[]>([]);
  const [loading,       setLoading]      = useState(true);
  const [refreshing,    setRefreshing]   = useState(false);
  const [lastRefresh,   setLastRefresh]  = useState(new Date());
  const [resolvingId,   setResolvingId]  = useState<string | null>(null);
  const [resolvedIds,   setResolvedIds]  = useState<string[]>([]);
  const [disabledUsers, setDisabledUsers] = useState<string[]>([]);
  const [userSearch,    setUserSearch]   = useState("");
  const [incidentSearch,setIncidentSearch] = useState("");
  const [incidentFilter,setIncidentFilter] = useState<string>("all");
  const [problemsOpenCount, setProblemsOpenCount] = useState(0);
  const [now, setNow]            = useState<Date>(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const { email: adminEmail, clearAuthSession } = useAuth();

  // ── Data loaders ─────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<ApiResponse<Stats>>(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear(); window.location.href = "/login";
      }
    }
  }, []);

  const loadSOS = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<ApiResponse<SOS[]>>(`${API}/api/admin/active-sos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data.data ?? []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear(); window.location.href = "/login";
      }
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<ApiResponse<AdminUser[]>>(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data ?? []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear(); window.location.href = "/login";
      }
    }
  }, []);

  const loadIncidents = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<ApiResponse<Incident[]>>(`${API}/api/admin/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(res.data.data ?? []);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear(); window.location.href = "/login";
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadSOS(), loadUsers(), loadIncidents()]);
    setLastRefresh(new Date());
    setRefreshing(false);
  }, [loadStats, loadSOS, loadUsers, loadIncidents]);

  // Admin resolves the SOS on the backend — this also ends emergency mode for the user
  // (their dashboard polls /api/sos/active and will see it's no longer returned).
  const handleResolveUI = useCallback(async (id: string) => {
    setResolvingId(id);
    try {
      await adminResolveSOS(id);
      setResolvedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      // Refresh admin views so counts/map update immediately
      await Promise.all([loadStats(), loadSOS()]);
      setLastRefresh(new Date());
      toast.success("SOS marked resolved. User's emergency mode will clear.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not resolve SOS.";
      toast.error(message);
    } finally {
      setResolvingId(null);
    }
  }, [loadStats, loadSOS]);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { window.location.href = "/login"; return; }
        const res = await axios.get<ApiResponse<{ user: { role: string } }>>(
          `${API}/api/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.data.user.role !== "admin") { window.location.href = "/dashboard"; return; }
        await Promise.all([loadStats(), loadSOS(), loadUsers(), loadIncidents()]);
        setLoading(false);
        setLastRefresh(new Date());
        const interval = setInterval(() => {
          loadStats(); loadSOS();
          setLastRefresh(new Date());
        }, 10000);
        return () => clearInterval(interval);
      } catch {
        window.location.href = "/login";
      }
    })();
  }, [loadStats, loadSOS, loadUsers, loadIncidents]);

  // ── Problems (mock service) — live-sync open count for sidebar badge ──
  useEffect(() => {
    const refresh = async () => {
      const all = await listAllProblems();
      setProblemsOpenCount(all.filter(p => p.status !== "resolved").length);
    };
    refresh();
    const unsub = subscribeProblems(refresh);
    return unsub;
  }, []);

  // Live clock (second-resolution for ops console)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Click-away + Escape for profile dropdown
  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [profileOpen]);

  const handleAdminSignOut = () => {
    clearAuthSession();
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  const adminInitials = (() => {
    const source = adminEmail || "SA";
    const local = source.split("@")[0] || "SA";
    const parts = local.split(/[.\s_-]+/).filter(Boolean);
    return ((parts[0]?.[0] || local[0] || "S") + (parts[1]?.[0] || "A")).toUpperCase();
  })();

  const visibleAlerts  = sosList.filter(s => !resolvedIds.includes(s._id));
  const activeSosCount = visibleAlerts.length;
  const hasEmergency   = activeSosCount > 0;

  const filteredUsers = users.filter(u => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  });

  const filteredIncidents = incidents.filter(i => {
    const q = incidentSearch.trim().toLowerCase();
    const matchQ = !q ||
      i.title?.toLowerCase().includes(q) ||
      i.user?.name?.toLowerCase().includes(q) ||
      i.user?.email?.toLowerCase().includes(q) ||
      i.location?.address?.toLowerCase().includes(q);
    const matchT = incidentFilter === "all" || i.type === incidentFilter;
    return matchQ && matchT;
  });

  const handleToggleUserUI = useCallback((id: string) => {
    setDisabledUsers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // ── Stat card definitions ──────────────────────────────────────────────────
  const statCards = [
    {
      icon: Users, label: "Total Users", value: stats?.totalUsers ?? 0,
      gradient: "from-blue-500 to-cyan-500", iconBg: "bg-blue-50", iconColor: "text-blue-500",
      sub: "Registered accounts",
    },
    {
      icon: Activity, label: "Total SOS", value: stats?.totalSOS ?? 0,
      gradient: "from-primary to-[oklch(0.48_0.22_330)]", iconBg: "bg-primary/10", iconColor: "text-primary",
      sub: "All-time alerts",
    },
    {
      icon: AlertTriangle, label: "Active SOS", value: activeSosCount,
      gradient: "from-red-500 to-rose-600", iconBg: "bg-red-50", iconColor: "text-red-500",
      sub: "Needs response", danger: true,
    },
    {
      icon: FileVideo, label: "Incidents", value: stats?.totalIncidents ?? 0,
      gradient: "from-violet-500 to-purple-600", iconBg: "bg-violet-50", iconColor: "text-violet-500",
      sub: "Reported cases",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">


      {/* Main content (sidebar is provided by /app/admin/layout.tsx) */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ═══════════════════ TOP HEADER (ops-console, two-tier) ═══════════════════ */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl backdrop-saturate-150 shrink-0 transition-colors ${
            hasEmergency
              ? "border-red-300/80 bg-red-50/90 shadow-[0_10px_30px_-12px_rgba(220,38,38,0.22)]"
              : "border-rose-200/60 bg-[rgba(253,232,240,0.75)] shadow-[0_10px_30px_-12px_rgba(173,20,87,0.18)]"
          }`}
        >
          {/* Ambient mesh */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 100px at 8% -30%, rgba(31,41,55,0.08), transparent 60%), radial-gradient(700px 80px at 90% -20%, rgba(173,20,87,0.07), transparent 60%)",
            }}
          />

          {/* ── Primary row ──────────────────────────────────────────── */}
          <div className="relative flex h-[60px] items-center gap-3 px-4 sm:px-6">
            {/* Breadcrumb + dynamic title */}
            <div className="min-w-0 flex flex-col leading-tight">
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-[#AD1457]">
                  <Home className="w-3 h-3" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="inline-flex items-center gap-1" style={{ color: "#AD1457" }}>
                  Admin
                  <span
                    className="rounded-[5px] border px-1 py-[1px] text-[9px] font-black uppercase tracking-[0.14em]"
                    style={{ color: "#AD1457", borderColor: "rgba(173,20,87,0.35)", background: "rgba(216,27,96,0.1)" }}
                  >
                    Control
                  </span>
                </span>
              </nav>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                  {hasEmergency ? "Emergency Response Mode" : "Control Center"}
                </h2>
                <span
                  className={`hidden md:inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider ${
                    hasEmergency
                      ? "border-red-300 bg-red-50 text-red-700 animate-pulse"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full ${hasEmergency ? "bg-red-500" : "bg-emerald-500"} animate-pulse`} />
                  {hasEmergency ? "Active Response" : "Nominal"}
                </span>
              </div>
            </div>

            <div className="flex-1" />

            {/* Live clock (second-level precision) */}
            <div className="hidden md:flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white/70 px-2 py-1 font-mono text-[10.5px] tracking-[0.12em] text-slate-700">
              <Clock className="w-3 h-3" />
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            {/* Emergency chip */}
            {hasEmergency && (
              <Link
                href="#active-sos"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100/90 px-2.5 py-1 text-[11px] font-bold text-red-700 transition-all animate-pulse hover:-translate-y-0.5"
              >
                <Radio className="w-3 h-3" />
                {activeSosCount} Active
              </Link>
            )}

            {/* Notification bell (problems + active) */}
            <div className="relative hidden sm:block">
              <Link
                href="/admin/problems"
                aria-label="Reports"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/25 hover:text-[#AD1457]"
              >
                <Bell className="w-3.5 h-3.5" />
                {problemsOpenCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D81B60] px-1 text-[9px] font-black text-white shadow-md">
                    {Math.min(99, problemsOpenCount)}
                  </span>
                )}
              </Link>
            </div>

            {/* Reports quick link */}
            <Link
              href="/admin/problems"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-[10px] border-2 border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/30 hover:text-[#AD1457]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reports
              {problemsOpenCount > 0 && (
                <span className="rounded-full bg-[#D81B60]/10 px-1.5 text-[10px] font-bold text-[#AD1457]">{problemsOpenCount}</span>
              )}
            </Link>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-slate-300 disabled:opacity-60 disabled:translate-y-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Divider */}
            <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

            {/* Profile dropdown (admin) */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(v => !v)}
                className="flex h-9 items-center gap-2 rounded-[10px] border-2 bg-white pl-1 pr-2 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/40"
                style={{ borderColor: "rgba(173,20,87,0.35)" }}
              >
                <span
                  className="relative flex h-7 w-7 items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #1f2937 0%, #AD1457 100%)",
                    boxShadow: "0 4px 12px -4px rgba(173,20,87,0.5)",
                  }}
                >
                  {adminInitials}
                  <span
                    className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white"
                    style={{ boxShadow: "0 0 0 1.5px #AD1457" }}
                  >
                    <HeartHandshake className="h-2 w-2" style={{ color: "#AD1457" }} />
                  </span>
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[60] mt-2 w-72 overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-[0_20px_50px_-12px_rgba(173,20,87,0.25)]"
                >
                  <div
                    className="flex items-center gap-3 px-3 py-3 text-white"
                    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1f2937 45%, #AD1457 100%)" }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 text-[13px] font-bold backdrop-blur-sm">
                      {adminInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Administrator</p>
                        <HeartHandshake className="h-3 w-3 text-white/90" />
                      </div>
                      <p className="truncate text-[13px] font-semibold">{adminEmail || "—"}</p>
                    </div>
                  </div>

                  {/* System snapshot tiles */}
                  <div className="grid grid-cols-3 gap-1 border-b border-slate-100 px-2 py-2">
                    <div className="rounded-[8px] bg-blue-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-blue-700">Users</p>
                      <p className="text-[14px] font-black text-blue-800">{loading ? "—" : stats?.totalUsers ?? 0}</p>
                    </div>
                    <div className={`rounded-[8px] px-2 py-1.5 text-center ${hasEmergency ? "bg-red-50" : "bg-emerald-50"}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${hasEmergency ? "text-red-700" : "text-emerald-700"}`}>Active</p>
                      <p className={`text-[14px] font-black ${hasEmergency ? "text-red-800" : "text-emerald-800"}`}>{activeSosCount}</p>
                    </div>
                    <div className="rounded-[8px] bg-rose-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#AD1457" }}>Total</p>
                      <p className="text-[14px] font-black" style={{ color: "#AD1457" }}>{loading ? "—" : stats?.totalSOS ?? 0}</p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <LayoutDashboard className="w-4 h-4" /> Admin Panel
                    </Link>
                    <Link href="/admin/problems" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <MessageCircle className="w-4 h-4" /> Problem Reports
                    </Link>
                    {hasEmergency && (
                      <a href="#active-sos" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50">
                        <AlertTriangle className="w-4 h-4" /> Active Alerts
                      </a>
                    )}
                    <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <Home className="w-4 h-4" /> Home
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => { setProfileOpen(false); handleAdminSignOut(); }}
                      className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Context strip — ops telemetry ────────────────────────── */}
          <div className={`relative hidden md:block border-t ${
            hasEmergency ? "border-red-200/60 bg-red-50/70" : "border-slate-200/60 bg-gradient-to-r from-slate-50 via-white to-rose-50/40"
          }`}>
            <div className="flex h-9 items-center justify-between gap-4 px-4 sm:px-6 text-[11px] font-semibold">
              {/* Left: system health */}
              <div className="flex items-center gap-2.5 overflow-hidden text-slate-600">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${
                  hasEmergency ? "border-red-300 bg-red-100 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  <Server className="w-3 h-3" />
                  <span className="font-mono tracking-wider">{hasEmergency ? "DEGRADED" : "OPERATIONAL"}</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5">
                  <Zap className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">Response · <span className="font-mono text-slate-900">~1.2s</span></span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5">
                  <BarChart3 className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">Users <span className="font-mono text-slate-900">{loading ? "—" : stats?.totalUsers ?? 0}</span></span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5">
                  <Activity className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">SOS <span className="font-mono text-slate-900">{loading ? "—" : stats?.totalSOS ?? 0}</span></span>
                </span>
                <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5">
                  <FileVideo className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">Incidents <span className="font-mono text-slate-900">{loading ? "—" : stats?.totalIncidents ?? 0}</span></span>
                </span>
              </div>

              {/* Right: connection + last sync + emergency hotline */}
              <div className="flex items-center gap-2.5 text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-600" />
                  <span className="font-mono text-emerald-700 tracking-wider">online</span>
                </span>
                <span className="hidden lg:inline-block h-3 w-px bg-slate-200" />
                <span className="hidden lg:inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span className="font-mono tracking-wider">nepal · utc+5:45</span>
                </span>
                <span className="hidden lg:inline-block h-3 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="font-mono tracking-wider">
                    sync {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <a
                  href="tel:100"
                  className="hidden xl:inline-flex items-center gap-1 font-bold text-red-700 transition-colors hover:text-red-800"
                >
                  <Radio className="w-3 h-3" />
                  Hotline · 100
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* ── Body — priority order: Alerts > Map > Stats > Reports ─────────── */}
        <main className="flex-1 px-4 sm:px-6 pt-3 pb-6 space-y-6 overflow-y-auto">

          {/* ═══════════ (1) HERO — brief system status banner ═══════════ */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 px-6 py-6 text-white shadow-2xl shadow-slate-950/10 md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,113,113,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.18),transparent_24%)]" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${
                  hasEmergency
                    ? "bg-gradient-to-br from-red-600 to-rose-800 shadow-red-500/40"
                    : "bg-gradient-to-br from-emerald-600 to-teal-800 shadow-emerald-500/30"
                }`}>
                  {hasEmergency && <span className="absolute inset-0 rounded-2xl border-2 border-red-400/50 animate-ping" />}
                  {hasEmergency
                    ? <Siren className="relative z-10 h-6 w-6 text-white" strokeWidth={1.5} />
                    : <HeartHandshake className="relative z-10 h-6 w-6 text-white" strokeWidth={1.5} />}
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${hasEmergency ? "text-red-300" : "text-emerald-300"}`}>
                    {hasEmergency ? `${activeSosCount} Emergency Alert${activeSosCount > 1 ? "s" : ""}` : "System Normal"}
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
                    {hasEmergency ? "Immediate response required" : "Platform running normally"}
                  </h2>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Users</p>
                  <p className="text-lg font-black text-blue-300">{loading ? "—" : stats?.totalUsers ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Total SOS</p>
                  <p className="text-lg font-black text-primary">{loading ? "—" : stats?.totalSOS ?? 0}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-2.5 ${hasEmergency ? "border-red-500/30 bg-red-500/10" : "border-white/10 bg-white/5"}`}>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">Active</p>
                  <p className={`text-lg font-black ${hasEmergency ? "text-red-300" : "text-emerald-300"}`}>{loading ? "—" : activeSosCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════ (2) ACTIVE SOS ALERTS — top priority section ═══════════ */}
          <Card id="active-sos" className={`border overflow-hidden scroll-mt-20 ${hasEmergency ? "border-red-300 shadow-lg shadow-red-500/10" : "border-border/60"}`}>
            <CardHeader className={`pb-3 border-b ${hasEmergency ? "border-red-200 bg-red-50/60" : "border-border/50"}`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  hasEmergency ? "bg-red-100 ring-2 ring-red-200" : "bg-emerald-50"
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${hasEmergency ? "text-red-600 animate-pulse" : "text-emerald-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    Active SOS Alerts
                    {hasEmergency && (
                      <Badge variant="destructive" className="rounded-full text-[10px] animate-pulse">
                        {activeSosCount} LIVE
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {hasEmergency
                      ? "Emergency alerts awaiting admin response — resolve once addressed"
                      : "No active emergencies — monitoring in real time"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              {loading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
                </div>
              ) : !hasEmergency ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-base font-bold text-foreground">All Clear</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    There are no active SOS alerts on the platform right now. Incoming alerts will appear here instantly.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {visibleAlerts.map((sos) => (
                    <div key={sos._id}
                      className="relative rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 via-rose-50/50 to-white p-4 hover:shadow-md hover:border-red-300 transition-all">
                      {/* Pulsing corner dot */}
                      <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                      </span>

                      {/* User row */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shrink-0 shadow-md shadow-red-500/30">
                          <span className="text-white font-black text-sm">{getInitials(sos.user?.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <p className="font-bold text-foreground text-sm truncate">{sos.user?.name || "Unknown User"}</p>
                          {sos.user?.email && (
                            <p className="text-[11px] text-muted-foreground truncate">{sos.user.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Details grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl bg-white/80 border border-red-100 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</p>
                          <p className="text-[11px] font-mono text-foreground mt-0.5 truncate">
                            {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/80 border border-red-100 px-2.5 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Triggered</p>
                          <p className="text-[11px] font-semibold text-foreground mt-0.5">
                            {relativeTime(sos.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status + actions */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="destructive" className="rounded-full text-[10px] animate-pulse uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3 mr-1" /> {sos.status}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <a href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors">
                            <Eye className="w-3 h-3" /> Details
                          </a>
                          <button type="button"
                            onClick={() => handleResolveUI(sos._id)}
                            disabled={resolvingId === sos._id}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-60">
                            {resolvingId === sos._id
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <CheckCircle className="w-3 h-3" />}
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ═══════════ (3) LIVE SOS MONITORING MAP ═══════════ */}
          <Card className="border border-border/60 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-wrap items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">Live SOS Monitoring</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Real-time location pins for every active alert on the platform
                  </CardDescription>
                </div>
                {visibleAlerts.length > 0 && (
                  <Badge variant="destructive" className="rounded-full text-xs animate-pulse">
                    {visibleAlerts.length} pin{visibleAlerts.length > 1 ? "s" : ""} live
                  </Badge>
                )}
                <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg text-xs"
                  onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh Map</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <LeafletMap sosList={visibleAlerts} />
            </CardContent>
          </Card>

          {/* ═══════════ (4) SYSTEM STATS ═══════════ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">System Overview</p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map(({ icon: Icon, label, value, gradient, iconBg, iconColor, sub, danger }) => (
                <Card key={label} className={`border hover:shadow-md transition-all duration-200 ${
                  danger && value > 0 ? "border-red-200 bg-red-50/40" : "border-border/60"
                }`}>
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3 ${
                      danger && value > 0 ? "ring-2 ring-red-200" : ""
                    }`}>
                      <Icon className={`w-5 h-5 ${iconColor} ${danger && value > 0 ? "animate-pulse" : ""}`} />
                    </div>
                    {loading
                      ? <Skeleton className="h-9 w-14 mb-1" />
                      : <p className={`text-4xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none`}>{value}</p>
                    }
                    <p className="text-xs font-bold text-foreground mt-2">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ═══════════ (5) INCIDENT REPORTS ═══════════ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Incident Reports</p>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Card className="border border-border/60 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <FileVideo className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">Reported Incidents</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {incidents.length} total · {filteredIncidents.length} shown
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search reports…"
                        value={incidentSearch}
                        onChange={(e) => setIncidentSearch(e.target.value)}
                        className="h-8 w-44 pl-8 rounded-lg text-xs"
                      />
                    </div>
                    <select
                      value={incidentFilter}
                      onChange={(e) => setIncidentFilter(e.target.value)}
                      className="h-8 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="all">All types</option>
                      {Object.entries(INCIDENT_STYLE).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                  </div>
                ) : filteredIncidents.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                      <FileVideo className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {incidents.length === 0 ? "No incident reports yet" : "No matching reports"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {incidents.length === 0
                        ? "Reports submitted by users will appear here."
                        : "Try a different search or filter."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/40">
                          <th className="text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground px-5 py-2.5">Incident</th>
                          <th className="text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground px-5 py-2.5 hidden md:table-cell">Reporter</th>
                          <th className="text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground px-5 py-2.5 hidden lg:table-cell">Location</th>
                          <th className="text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground px-5 py-2.5">Time</th>
                          <th className="text-right font-semibold text-[11px] uppercase tracking-wider text-muted-foreground px-5 py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIncidents.map((inc) => {
                          const style = INCIDENT_STYLE[inc.type] || INCIDENT_STYLE.other;
                          return (
                            <tr key={inc._id} className="border-b border-border/60 last:border-0 hover:bg-secondary/30 transition-colors">
                              <td className="px-5 py-3">
                                <div className="flex items-start gap-2.5">
                                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${style.dot}`} />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-foreground truncate max-w-[240px]">{inc.title}</p>
                                    <span className={`inline-block mt-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.chip}`}>
                                      {incidentLabel(inc)}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3 hidden md:table-cell">
                                {inc.user ? (
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-[oklch(0.48_0.22_330)] flex items-center justify-center shrink-0">
                                      <span className="text-white font-bold text-[10px]">{getInitials(inc.user.name)}</span>
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-medium text-foreground truncate max-w-[140px]">{inc.user.name || "—"}</p>
                                      <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{inc.user.email || ""}</p>
                                    </div>
                                  </div>
                                ) : <span className="text-xs text-muted-foreground">Unknown</span>}
                              </td>
                              <td className="px-5 py-3 hidden lg:table-cell">
                                {inc.location ? (
                                  <a
                                    href={`https://www.google.com/maps?q=${inc.location.latitude},${inc.location.longitude}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <MapPin className="w-3 h-3" />
                                    {inc.location.address
                                      ? <span className="truncate max-w-[180px]">{inc.location.address}</span>
                                      : <>{inc.location.latitude.toFixed(3)}, {inc.location.longitude.toFixed(3)}</>}
                                  </a>
                                ) : <span className="text-xs text-muted-foreground">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                <p className="text-xs font-medium text-foreground">{relativeTime(inc.occurredAt || inc.createdAt)}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {new Date(inc.occurredAt || inc.createdAt || "").toLocaleDateString()}
                                </p>
                              </td>
                              <td className="px-5 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    alert(
                                      `Incident: ${inc.title}\nType: ${incidentLabel(inc)}\nReporter: ${inc.user?.name || "Unknown"} (${inc.user?.email || "—"})\nReported: ${new Date(inc.createdAt || "").toLocaleString()}`
                                    )
                                  }
                                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors"
                                >
                                  <Eye className="w-3 h-3" /> View
                                </button>
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

          {/* ═══════════ (6) USER MANAGEMENT ═══════════ */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">User Management</p>
              <div className="h-px flex-1 bg-border" />
            </div>

            <Card className="border border-border/60 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">Registered Users</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {users.length} total · {filteredUsers.length} shown
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search users…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="h-8 w-44 pl-8 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loading ? (
                  <div className="p-5 space-y-3">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center py-14 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                      <Users className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {users.length === 0 ? "No users yet" : "No matching users"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {filteredUsers.map((u) => {
                      const isDisabled = disabledUsers.includes(u._id);
                      const isAdminRole = u.role === "admin";
                      return (
                        <div
                          key={u._id}
                          className={`flex flex-wrap items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors ${
                            isDisabled ? "opacity-60" : ""
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                            isAdminRole
                              ? "bg-gradient-to-br from-amber-400 to-orange-500"
                              : "bg-gradient-to-br from-primary to-[oklch(0.48_0.22_330)]"
                          }`}>
                            <span className="text-white font-black text-xs">{getInitials(u.name)}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm text-foreground truncate">{u.name}</p>
                              {isAdminRole && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                  <HeartHandshake className="w-2.5 h-2.5" /> Admin
                                </span>
                              )}
                              {u.isEmailVerified ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                                  <MailCheck className="w-2.5 h-2.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                  <Mail className="w-2.5 h-2.5" /> Unverified
                                </span>
                              )}
                              {isDisabled && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">
                                  <UserX className="w-2.5 h-2.5" /> Disabled
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                              {u.createdAt && (
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  Joined {new Date(u.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                alert(
                                  `User Profile\n\nName: ${u.name}\nEmail: ${u.email}\nRole: ${u.role}\nVerified: ${u.isEmailVerified ? "Yes" : "No"}\nJoined: ${u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}`
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View
                            </button>
                            {!isAdminRole && (
                              <button
                                type="button"
                                onClick={() => handleToggleUserUI(u._id)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                  isDisabled
                                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                }`}
                              >
                                {isDisabled ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" /> Enable
                                  </>
                                ) : (
                                  <>
                                    <UserX className="w-3 h-3" /> Disable
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
