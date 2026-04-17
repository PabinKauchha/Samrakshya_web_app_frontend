"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HeartHandshake,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  Activity,
  Globe,
  Flame,
  Shield,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import {
  listAllProblems,
  subscribeProblems,
  type Problem,
} from "@/lib/problems-service";

const ROSE = "#D81B60";
const ROSE_DARK = "#AD1457";
const ROSE_DEEP = "#880E4F";

function derivePriority(p: Problem): "high" | "medium" | "low" {
  if (p.category === "safety") return "high";
  if (p.category === "bug" || p.category === "account") return "medium";
  if (p.status === "pending") return "medium";
  return "low";
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { email, clearAuthSession } = useAuth();

  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    let mounted = true;
    const pull = async () => {
      const all = await listAllProblems();
      if (mounted) setProblems(all);
    };
    pull();
    const unsub = subscribeProblems(pull);
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const highCount = problems.filter((p) => derivePriority(p) === "high").length;
  const pendingCount = problems.filter((p) => p.status !== "resolved").length;

  const initials = (() => {
    if (!email) return "AD";
    const local = email.split("@")[0] || "";
    const parts = local.split(/[.\-_]/).filter(Boolean);
    return `${parts[0]?.[0] || local[0] || "A"}${
      parts[1]?.[0] || parts[0]?.[1] || "D"
    }`.toUpperCase();
  })();

  const handleSignOut = () => {
    clearAuthSession();
    router.replace("/");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href.startsWith("/admin")) {
      const base = href.split("#")[0];
      return pathname === base || pathname?.startsWith(base + "/");
    }
    return pathname === href;
  };

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col overflow-hidden md:flex"
      style={{
        background:
          "linear-gradient(180deg, rgba(253,232,240,0.88) 0%, rgba(252,220,232,0.82) 55%, rgba(255,241,246,0.85) 100%)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow:
          "4px 0 28px -12px rgba(173,20,87,0.14), inset -1px 0 0 rgba(216,27,96,0.08)",
      }}
    >
      {/* Ambient pink mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(420px 200px at 20% -10%, rgba(216,27,96,0.14), transparent 60%), radial-gradient(360px 220px at 110% 110%, rgba(255,182,203,0.22), transparent 60%)",
        }}
      />

      {/* Right-edge gradient hairline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(216,27,96,0) 0%, rgba(216,27,96,0.35) 25%, rgba(255,255,255,0.8) 50%, rgba(216,27,96,0.35) 75%, rgba(216,27,96,0) 100%)",
        }}
      />

      {/* Brand */}
      <Link
        href="/"
        aria-label="Samrakshya — go to home"
        className="group relative z-10 flex items-center gap-2.5 border-b border-rose-200/50 px-4 py-3.5 transition-colors hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/50"
      >
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-[12px] transition-transform duration-200 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 55%, ${ROSE_DEEP} 100%)`,
            boxShadow: `0 10px 24px -8px ${ROSE_DARK}70, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        >
          <HeartHandshake className="h-4 w-4 text-white drop-shadow" />
          <span
            aria-hidden
            className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/90 shadow"
          >
            <Sparkles className="h-2 w-2" style={{ color: ROSE }} />
          </span>
        </div>
        <div className="leading-tight">
          <p className="text-[13.5px] font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-[#AD1457]">
            Samrakshya
          </p>
          <p
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: ROSE_DARK }}
          >
            Admin Console
          </p>
        </div>
      </Link>

      {/* Nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2.5 py-3">
        <p className="px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
          Manage
        </p>
        <SidebarItem
          href="/admin"
          icon={LayoutDashboard}
          label="Control Center"
          active={isActive("/admin")}
        />
        <SidebarItem
          href="/admin/problems"
          icon={MessageSquare}
          label="Problem Reports"
          active={isActive("/admin/problems")}
          badge={
            pendingCount > 0 ? { text: String(pendingCount) } : undefined
          }
        />
        <SidebarItem
          href="/admin#active-sos"
          icon={AlertTriangle}
          label="Active Alerts"
          badge={
            highCount > 0
              ? { text: String(highCount), urgent: true }
              : undefined
          }
        />

        <p className="mt-4 px-2 pb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
          System
        </p>
        <SidebarItem href="/admin" icon={Activity} label="Telemetry" />
        <SidebarItem href="/" icon={Globe} label="Landing Page" />

        <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-rose-200/80 to-transparent" />

        {/* Status tiles */}
        <div className="space-y-1.5 px-0.5">
          <StatusTile
            icon={Shield}
            iconColor="text-emerald-600"
            label="System"
            value="Online"
            valueTone="emerald"
          />
          <StatusTile
            icon={Flame}
            iconColor={highCount > 0 ? undefined : "text-rose-400"}
            iconStyle={highCount > 0 ? { color: ROSE } : undefined}
            label="Priority"
            value={highCount > 0 ? `${highCount} high` : "Calm"}
            valueTone={highCount > 0 ? "rose" : "slate"}
          />
        </div>
      </nav>

      {/* Profile footer */}
      <div className="relative z-10 border-t border-rose-200/50 px-2.5 pb-3 pt-2">
        <div
          className="flex items-center gap-2.5 rounded-[12px] border border-rose-100/70 px-2.5 py-2 shadow-sm"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.75) 0%, rgba(255,241,246,0.75) 100%)",
          }}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[11px] font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              boxShadow: `0 6px 14px -5px ${ROSE_DARK}70`,
            }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[11.5px] font-bold text-slate-900">
              {email || "admin"}
            </p>
            <p
              className="text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ color: ROSE_DARK }}
            >
              Administrator
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center gap-2 rounded-[10px] border border-transparent px-2.5 py-1.5 text-[11.5px] font-semibold text-slate-600 transition-all hover:border-rose-200 hover:bg-white/70 hover:text-[#AD1457]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: { text: string; urgent?: boolean };
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[12.5px] font-semibold transition-all ${
        active
          ? "text-[#AD1457]"
          : "text-slate-700 hover:text-[#AD1457]"
      }`}
      style={
        active
          ? {
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,235,244,0.85) 100%)",
              boxShadow:
                "0 2px 10px -4px rgba(173,20,87,0.22), inset 0 0 0 1px rgba(216,27,96,0.18)",
            }
          : undefined
      }
      onMouseEnter={(e) => {
        if (active) return;
        (e.currentTarget as HTMLAnchorElement).style.background =
          "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,241,246,0.55) 100%)";
      }}
      onMouseLeave={(e) => {
        if (active) return;
        (e.currentTarget as HTMLAnchorElement).style.background = "";
      }}
    >
      {/* Left accent bar when active */}
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
          style={{
            background: `linear-gradient(180deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
            boxShadow: `0 0 10px ${ROSE}aa`,
          }}
        />
      )}
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          active
            ? "text-[#D81B60]"
            : "text-slate-500 group-hover:text-[#D81B60]"
        }`}
      />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge && (
        <span
          className="inline-flex h-[18px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[9.5px] font-extrabold"
          style={
            badge.urgent
              ? {
                  background:
                    "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)",
                  color: "white",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.8)",
                }
              : {
                  background: "rgba(216,27,96,0.12)",
                  color: ROSE_DARK,
                  boxShadow: "inset 0 0 0 1px rgba(216,27,96,0.18)",
                }
          }
        >
          {badge.text}
        </span>
      )}
    </Link>
  );
}

function StatusTile({
  icon: Icon,
  iconColor,
  iconStyle,
  label,
  value,
  valueTone,
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconStyle?: React.CSSProperties;
  label: string;
  value: string;
  valueTone: "emerald" | "rose" | "slate";
}) {
  const valueClass =
    valueTone === "emerald"
      ? "text-emerald-600"
      : valueTone === "rose"
        ? "text-[#AD1457]"
        : "text-slate-500";
  return (
    <div
      className="flex items-center justify-between rounded-[10px] border border-rose-100/70 px-2.5 py-1.5 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,243,247,0.72) 100%)",
      }}
    >
      <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
        <Icon
          className={`h-3 w-3 ${iconColor ?? ""}`}
          style={iconStyle}
        />
        {label}
      </span>
      <span
        className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
