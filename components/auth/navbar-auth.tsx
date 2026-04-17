"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Video,
  HeartHandshake,
  AlertTriangle,
  Activity,
  Mail,
  User2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

const ROSE = "#D81B60";
const ROSE_DARK = "#AD1457";

type NavbarAuthProps = {
  isMobile?: boolean;
  onAfterAction?: () => void;
};

export function NavbarAuth({ isMobile = false, onAfterAction }: NavbarAuthProps) {
  const router = useRouter();
  const { email, isAuthenticated, isAdmin, clearAuthSession } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isMobile) return;
    const onClickAway = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAway);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickAway);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isMobile]);

  const initials = (() => {
    if (!email) return "SA";
    const local = email.split("@")[0] || "";
    const parts = local.split(/[.\-_]/).filter(Boolean);
    return `${parts[0]?.[0] || local[0] || "S"}${parts[1]?.[0] || parts[0]?.[1] || "A"}`.toUpperCase();
  })();

  const signOut = () => {
    clearAuthSession();
    onAfterAction?.();
    router.push("/");
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LOGGED OUT
  // ══════════════════════════════════════════════════════════════════════════
  if (!isAuthenticated) {
    if (isMobile) {
      return (
        <>
          <Link
            href="/login"
            onClick={onAfterAction}
            className="rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
          >
            Log In
          </Link>
          <Link
            href="/register"
            onClick={onAfterAction}
            className="rounded-[10px] px-3 py-2.5 text-center text-[14px] font-semibold text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)` }}
          >
            Sign Up
          </Link>
        </>
      );
    }
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-[10px] px-4 text-[13.5px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-[#AD1457]"
          asChild
        >
          <Link href="/login">Log In</Link>
        </Button>
        <Button
          size="sm"
          className="h-10 rounded-[10px] px-4 text-[13.5px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
            boxShadow: `0 6px 20px -6px ${ROSE_DARK}80`,
          }}
          asChild
        >
          <Link href="/register">Sign Up</Link>
        </Button>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE (logged in)
  // ══════════════════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        <div className="rounded-[10px] border border-rose-100 bg-rose-50/60 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Signed in
            </p>
            {isAdmin && (
              <span
                className="inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{ borderColor: `${ROSE_DARK}40`, background: "#fff", color: ROSE_DARK }}
              >
                <HeartHandshake className="h-2.5 w-2.5" /> Admin
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[14px] font-semibold text-slate-900">{email}</p>
        </div>

        {isAdmin ? (
          <>
            <Link
              href="/admin"
              onClick={onAfterAction}
              className="mt-2 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)` }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin Panel
            </Link>
            <Link
              href="/admin"
              onClick={onAfterAction}
              className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[14px] font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <AlertTriangle className="h-4 w-4" />
              Active Alerts
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/report"
              onClick={onAfterAction}
              className="mt-2 flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)` }}
            >
              <Video className="h-4 w-4" />
              Report Incident
            </Link>
            <Link
              href="/dashboard"
              onClick={onAfterAction}
              className="flex items-center gap-2 rounded-[10px] border border-rose-200 bg-white px-3 py-2.5 text-[14px] font-semibold text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </>
        )}

        <Link
          href={isAdmin ? "/admin/problems" : "/problems"}
          onClick={onAfterAction}
          className="flex items-center gap-2 rounded-[10px] border border-rose-200 bg-white px-3 py-2.5 text-[14px] font-semibold text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
        >
          <MessageCircle className="h-4 w-4" />
          {isAdmin ? "Problem Reports" : "Share a Problem"}
        </Link>

        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-left text-[14px] font-semibold text-rose-700 transition-colors hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP (logged in) — Admin: solid PRIMARY + outlined secondary / User: solid + ghost
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <>
      {isAdmin ? (
        <>
          {/* SOLID: Admin Panel (primary weight) */}
          <Button
            size="sm"
            className="group h-10 gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              boxShadow: `0 6px 20px -6px ${ROSE_DARK}80`,
            }}
            asChild
          >
            <Link href="/admin">
              <Activity className="h-4 w-4" />
              Admin Panel
            </Link>
          </Button>

          {/* OUTLINED: Alerts (secondary weight) */}
          <Button
            variant="outline"
            size="sm"
            className="group h-10 gap-1.5 rounded-[10px] border-2 bg-white px-3.5 text-[13.5px] font-semibold transition-all hover:-translate-y-0.5"
            style={{
              borderColor: `${ROSE_DARK}35`,
              color: ROSE_DARK,
            }}
            asChild
          >
            <Link href="/admin">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </Link>
          </Button>
        </>
      ) : (
        <>
          {/* SOLID: Report (primary weight for users) */}
          <Button
            size="sm"
            className="group h-10 gap-1.5 rounded-[10px] px-4 text-[13.5px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              boxShadow: `0 6px 20px -6px ${ROSE_DARK}80`,
            }}
            asChild
          >
            <Link href="/report">
              <Video className="h-4 w-4" />
              Report
            </Link>
          </Button>

          {/* OUTLINED: Dashboard */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 rounded-[10px] border-2 border-slate-200 bg-white px-3.5 text-[13.5px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/30 hover:text-[#AD1457]"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </>
      )}

      {/* Profile pill */}
      <div className="relative ml-1" ref={rootRef}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Open profile menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 items-center gap-2 rounded-[10px] border-2 bg-white pl-1 pr-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/40"
          style={{ borderColor: isAdmin ? `${ROSE_DARK}35` : "#e2e8f0" }}
        >
          <span
            className="relative flex h-7 w-7 items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
            style={{
              background: isAdmin
                ? `linear-gradient(135deg, #1f2937 0%, ${ROSE_DARK} 100%)`
                : `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              boxShadow: `0 4px 12px -4px ${ROSE_DARK}60`,
            }}
          >
            {initials}
            {isAdmin && (
              <span
                className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white"
                style={{ boxShadow: `0 0 0 1.5px ${ROSE_DARK}` }}
              >
                <HeartHandshake className="h-2 w-2" style={{ color: ROSE_DARK }} />
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-[12px] border border-slate-100 bg-white shadow-[0_20px_50px_-12px_rgba(173,20,87,0.25)]"
          >
            {/* Profile header */}
            <div
              className="flex items-center gap-3 px-3 py-3"
              style={{
                background: isAdmin
                  ? `linear-gradient(135deg, #1f2937 0%, ${ROSE_DARK} 100%)`
                  : `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 100%)`,
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 text-[13px] font-bold text-white backdrop-blur-sm">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">
                    {isAdmin ? "Administrator" : "Signed in as"}
                  </p>
                  {isAdmin && <HeartHandshake className="h-3 w-3 text-white/90" />}
                </div>
                <p className="truncate text-[13px] font-semibold text-white">{email}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <MenuItem
                icon={User2}
                label={email || "Profile"}
                sub="Account info"
                disabled
              />
              <MenuItem
                icon={LayoutDashboard}
                label={isAdmin ? "Admin Panel" : "Dashboard"}
                href={isAdmin ? "/admin" : "/dashboard"}
                onNav={() => setOpen(false)}
              />
              {isAdmin && (
                <MenuItem
                  icon={AlertTriangle}
                  label="Active Alerts"
                  href="/admin"
                  tone="danger"
                  onNav={() => setOpen(false)}
                />
              )}
              {!isAdmin && (
                <MenuItem
                  icon={Mail}
                  label="Report Incident"
                  href="/report"
                  onNav={() => setOpen(false)}
                />
              )}

              <MenuItem
                icon={MessageCircle}
                label={isAdmin ? "Problem Reports" : "Share a Problem"}
                href={isAdmin ? "/admin/problems" : "/problems"}
                onNav={() => setOpen(false)}
              />

              <div className="my-1 h-px bg-slate-100" />

              <MenuItem
                icon={LogOut}
                label="Sign Out"
                tone="danger"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Menu item ────────────────────────────────────────────────────────────────
function MenuItem({
  icon: Icon,
  label,
  sub,
  href,
  onClick,
  onNav,
  disabled,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  href?: string;
  onClick?: () => void;
  onNav?: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  const cls =
    tone === "danger"
      ? "text-rose-700 hover:bg-rose-50"
      : "text-slate-800 hover:bg-rose-50 hover:text-[#AD1457]";

  const inner = (
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{label}</p>
        {sub && <p className="truncate text-[10px] text-slate-500">{sub}</p>}
      </div>
    </div>
  );

  const base =
    "flex w-full items-center gap-2 rounded-[8px] px-2.5 py-2 text-left transition-colors";

  if (disabled) {
    return <div className={`${base} text-slate-400 cursor-default`}>{inner}</div>;
  }
  if (href) {
    return (
      <Link href={href} role="menuitem" onClick={onNav} className={`${base} ${cls}`}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" role="menuitem" onClick={onClick} className={`${base} ${cls}`}>
      {inner}
    </button>
  );
}
