"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu, X, HeartHandshake, ArrowRight,
  Clock, Radio, AlertTriangle, Shield, Activity,
  Globe, Phone, Lock, Sparkles, Wifi, ChevronRight,
} from "lucide-react";
import { NavbarAuth } from "@/components/auth/navbar-auth";
import { useAuth } from "@/components/auth/auth-provider";
import { adminGetActiveSOSList } from "@/lib/api";

// ── Deep Rose palette ────────────────────────────────────────────────────────
const ROSE = "#D81B60";
const ROSE_DARK = "#AD1457";
const ROSE_DEEPER = "#880E4F";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, email } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [now, setNow] = useState<Date>(new Date());

  const [adminActiveCount, setAdminActiveCount] = useState(0);
  const [userEmergencyActive, setUserEmergencyActive] = useState(false);

  // ── Scroll handling ───────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Live clock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // ── Admin: poll active SOS ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) { setAdminActiveCount(0); return; }
    let mounted = true;
    const pull = async () => {
      try {
        const res = await adminGetActiveSOSList();
        if (!mounted) return;
        setAdminActiveCount(Array.isArray(res?.data) ? res.data.length : 0);
      } catch { if (mounted) setAdminActiveCount(0); }
    };
    pull();
    const id = setInterval(pull, 15_000);
    return () => { mounted = false; clearInterval(id); };
  }, [isAdmin]);

  // ── User: emergency state via localStorage ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || isAdmin) { setUserEmergencyActive(false); return; }
    const read = () => setUserEmergencyActive(!!localStorage.getItem("activeSosId"));
    read();
    const id = setInterval(read, 2500);
    const onStorage = (e: StorageEvent) => { if (e.key === "activeSosId") read(); };
    window.addEventListener("storage", onStorage);
    return () => { clearInterval(id); window.removeEventListener("storage", onStorage); };
  }, [isAuthenticated, isAdmin]);

  // ── Nav links ─────────────────────────────────────────────────────────────
  const navLinks = useMemo(() => (
    isAdmin
      ? [
          { href: "/", label: "Overview", hint: "Landing" },
          { href: "/admin", label: "Control Center", hint: "Live ops" },
          { href: "/admin/problems", label: "Problems", hint: "User reports" },
        ]
      : [
          { href: "#features", label: "Features", hint: "What it does" },
          { href: "#how-it-works", label: "How It Works", hint: "In 3 steps" },
          { href: "#testimonials", label: "Testimonials", hint: "Real voices" },
          { href: "#contact", label: "Contact", hint: "Talk to us" },
        ]
  ), [isAdmin]);

  const emergencyVisible = isAdmin ? adminActiveCount > 0 : userEmergencyActive;

  // Greeting for auth users (sub-strip)
  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 5)  return "Good night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  }, [now]);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Hair-thin scroll progress bar */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[2px] z-[1] transition-[width] duration-150"
        style={{
          width: `${scrollPct}%`,
          background: `linear-gradient(90deg, ${ROSE} 0%, ${ROSE_DARK} 50%, ${ROSE_DEEPER} 100%)`,
          boxShadow: `0 0 8px ${ROSE_DARK}60`,
        }}
      />

      <div
        className={`relative transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150 ${
          emergencyVisible
            ? "bg-[rgba(254,226,226,0.62)] shadow-[0_10px_30px_-12px_rgba(220,38,38,0.25)]"
            : scrolled
              ? "bg-[rgba(253,232,240,0.72)] shadow-[0_10px_30px_-12px_rgba(173,20,87,0.20)]"
              : "bg-[rgba(253,232,240,0.55)]"
        }`}
      >
        {/* Ambient mesh behind glass (subtle) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.65]"
          style={{
            background:
              "radial-gradient(1200px 160px at 15% -20%, rgba(216,27,96,0.14), transparent 60%), radial-gradient(800px 140px at 85% -10%, rgba(173,20,87,0.12), transparent 60%), radial-gradient(600px 200px at 50% 120%, rgba(255,255,255,0.55), transparent 60%)",
          }}
        />

        {/* Subtle pink → white → pink gradient bottom border */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background: emergencyVisible
              ? "linear-gradient(90deg, rgba(239,68,68,0) 0%, rgba(239,68,68,0.55) 50%, rgba(239,68,68,0) 100%)"
              : "linear-gradient(90deg, rgba(216,27,96,0) 0%, rgba(216,27,96,0.55) 30%, rgba(255,255,255,0.9) 50%, rgba(216,27,96,0.55) 70%, rgba(216,27,96,0) 100%)",
          }}
        />

        {/* ── PRIMARY ROW ────────────────────────────────────────────────── */}
        <div className="relative mx-auto flex h-[76px] max-w-7xl items-center gap-4 px-5 md:px-8">
          {/* ── Brand ─────────────────────────────────────────────────── */}
          <Link
            href={isAdmin ? "/admin" : "/"}
            className="group flex items-center gap-3 transition-opacity hover:opacity-95"
            aria-label="Samrakshya home"
          >
            <div className="relative">
              {/* Orbit ring */}
              <span
                aria-hidden
                className="absolute -inset-1 rounded-[14px] opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `conic-gradient(from 0deg, ${ROSE}, ${ROSE_DARK}, ${ROSE_DEEPER}, ${ROSE})`,
                }}
              />
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-[12px] shadow-lg transition-transform duration-300 group-hover:scale-[1.03]"
                style={{
                  background: isAdmin
                    ? `linear-gradient(135deg, #1f2937 0%, ${ROSE_DARK} 100%)`
                    : `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 55%, ${ROSE_DEEPER} 100%)`,
                  boxShadow: `0 12px 28px -8px ${ROSE_DARK}70, inset 0 1px 0 rgba(255,255,255,0.25)`,
                }}
              >
                <HeartHandshake className="h-5 w-5 text-white" strokeWidth={2.2} />
                {/* Pulsing ring (heartbeat-like) */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-[12px] ring-2 ring-white/25"
                />
                <span
                  aria-hidden
                  className="absolute -inset-1 rounded-[14px] border-2 border-rose-300/30 animate-ping"
                  style={{ animationDuration: "3.5s" }}
                />
                {isAdmin && (
                  <span
                    className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white"
                    style={{ boxShadow: `0 0 0 2px ${ROSE_DARK}` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: ROSE_DARK }} />
                  </span>
                )}
              </div>
            </div>

            <div className="hidden sm:flex flex-col leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-extrabold tracking-[-0.015em] text-slate-900">
                  Samrakshya
                </span>
                {isAdmin ? (
                  <span
                    className="rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      color: ROSE_DARK,
                      borderColor: `${ROSE_DARK}40`,
                      background: `${ROSE}12`,
                    }}
                  >
                    Admin
                  </span>
                ) : (
                  <span
                    className="hidden lg:inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      color: "#065f46",
                      borderColor: "#10b98140",
                      background: "#ecfdf5",
                    }}
                  >
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {isAdmin ? "Ops · Response · Care" : "Women Safety Platform · Nepal"}
              </span>
            </div>
          </Link>

          {/* ── Center nav (richer pill hover) ───────────────────────── */}
          <nav
            className="mx-auto hidden items-center gap-0.5 md:flex"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href.startsWith("/") && (pathname === link.href || pathname?.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`group relative rounded-[10px] px-3.5 py-2 text-[13.5px] font-semibold tracking-[-0.005em] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/40 ${
                    isActive
                      ? "text-[#D81B60]"
                      : "text-slate-900 hover:text-[#D81B60]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Glowing pink underline */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-x-3.5 -bottom-[3px] h-[2px] origin-center rounded-full transition-all duration-300 ease-out ${
                      isActive
                        ? "scale-x-100 opacity-100"
                        : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 group-focus-visible:opacity-100"
                    }`}
                    style={{
                      background: ROSE,
                      boxShadow: `0 0 8px ${ROSE}B3, 0 0 14px ${ROSE}66, 0 0 2px ${ROSE}`,
                    }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* ── Right: chips + auth ──────────────────────────────────── */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            {/* Emergency pill (admin) */}
            {isAdmin && adminActiveCount > 0 && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100/90 px-2.5 py-1 text-[11px] font-bold text-red-700 transition-all animate-pulse hover:-translate-y-0.5"
              >
                <Radio className="h-3 w-3" />
                {adminActiveCount} Active
              </Link>
            )}

            {/* Emergency pill (user) */}
            {!isAdmin && userEmergencyActive && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100/90 px-2.5 py-1 text-[11px] font-bold text-red-700 transition-all animate-pulse hover:-translate-y-0.5"
              >
                <AlertTriangle className="h-3 w-3" />
                Emergency
              </Link>
            )}

            {/* Divider */}
            <div className="hidden lg:block h-7 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent" />

            {isAuthenticated ? (
              <NavbarAuth />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-[10px] px-4 text-[13.5px] font-semibold text-slate-900 hover:bg-rose-100/60 hover:text-[#D81B60]"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  size="sm"
                  className="group relative h-10 gap-1.5 overflow-hidden rounded-[10px] px-4 text-[13.5px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 55%, ${ROSE_DEEPER} 100%)`,
                    boxShadow: `0 8px 24px -8px ${ROSE_DARK}90`,
                  }}
                  asChild
                >
                  <Link href="/register">
                    <span className="relative z-10 inline-flex items-center gap-1.5">
                      Get Started
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {/* Shine */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* ── Mobile: emergency dot + menu trigger ─────────────────── */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            {emergencyVisible && (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 animate-pulse ring-2 ring-red-200">
                {isAdmin ? <Radio className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              </span>
            )}
            <button
              className="rounded-[10px] p-2 text-slate-900 transition-colors hover:bg-rose-100/60 hover:text-[#D81B60]"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* ── SECONDARY STRIP (telemetry / context) ─────────────────────── */}
        <div
          className={`relative hidden md:block border-t transition-colors ${
            emergencyVisible ? "border-red-200/60 bg-red-50/60" : "border-rose-100/60 bg-gradient-to-r from-rose-50/40 via-white/50 to-rose-50/40"
          }`}
        >
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 px-5 text-[11px] font-semibold md:px-8">
            {/* Left: role-aware context */}
            <div className="flex items-center gap-3 text-slate-600">
              {isAuthenticated ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full animate-pulse"
                      style={{ background: emergencyVisible ? "#ef4444" : "#10b981" }}
                    />
                    <span className={emergencyVisible ? "text-red-700" : "text-emerald-700"}>
                      {emergencyVisible ? "Emergency Mode" : "System Nominal"}
                    </span>
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Sparkles className="h-3 w-3" style={{ color: ROSE_DARK }} />
                    {greeting}, <span className="font-bold text-slate-700">{(email || "").split("@")[0] || "friend"}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Platform · Operational
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span className="hidden lg:inline-flex items-center gap-1 text-slate-500">
                    <Shield className="h-3 w-3" style={{ color: ROSE_DARK }} />
                    Encrypted end-to-end
                  </span>
                  <span className="hidden lg:inline-block h-3 w-px bg-slate-200" />
                  <span className="hidden xl:inline-flex items-center gap-1 text-slate-500">
                    <Globe className="h-3 w-3" style={{ color: ROSE_DARK }} />
                    कtमाडौं · Nepal
                  </span>
                </>
              )}
            </div>

            {/* Right: live telemetry */}
            <div className="flex items-center gap-3 text-slate-500">
              {isAdmin && (
                <>
                  <span className="inline-flex items-center gap-1">
                    <Activity className="h-3 w-3" style={{ color: ROSE_DARK }} />
                    <span className="font-mono tracking-wider">SOS:</span>
                    <span className={`font-bold ${adminActiveCount > 0 ? "text-red-700" : "text-emerald-700"}`}>
                      {adminActiveCount}
                    </span>
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                </>
              )}
              <span className="hidden lg:inline-flex items-center gap-1">
                <Wifi className="h-3 w-3 text-emerald-600" />
                <span className="font-mono text-emerald-700 tracking-wider">online</span>
              </span>
              <span className="hidden lg:inline-block h-3 w-px bg-slate-200" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="font-mono tracking-wider text-slate-700">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
              {!isAuthenticated && (
                <>
                  <span className="h-3 w-px bg-slate-200" />
                  <Link
                    href="/login"
                    className="hidden lg:inline-flex items-center gap-1 transition-colors hover:text-[#AD1457]"
                  >
                    <Lock className="h-3 w-3" />
                    Sign in
                  </Link>
                </>
              )}
              <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
              <a
                href="tel:100"
                className="hidden xl:inline-flex items-center gap-1 font-bold text-red-700 transition-colors hover:text-red-800"
              >
                <Phone className="h-3 w-3" />
                Police · 100
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sheet ─────────────────────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-[rgba(253,232,240,0.85)] shadow-lg backdrop-blur-2xl backdrop-saturate-150 transition-[max-height,opacity] duration-300 md:hidden ${
          isMenuOpen ? "max-h-[720px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          borderBottom: "1px solid transparent",
          borderImage:
            "linear-gradient(90deg, rgba(216,27,96,0) 0%, rgba(216,27,96,0.55) 50%, rgba(216,27,96,0) 100%) 1",
        }}
      >
        <nav
          className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4"
          aria-label="Mobile navigation"
        >
          {emergencyVisible && (
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              onClick={() => setIsMenuOpen(false)}
              className="mb-2 flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50 px-3 py-2.5 text-[13px] font-bold text-red-700 animate-pulse"
            >
              {isAdmin
                ? <><Radio className="h-4 w-4" /> {adminActiveCount} Active SOS — open Control Center</>
                : <><AlertTriangle className="h-4 w-4" /> Emergency active — open Dashboard</>}
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          )}

          {/* Section header */}
          <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Navigate
          </p>

          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-rose-100/60 hover:text-[#D81B60]"
            >
              <span className="relative">
                {link.label}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-[2px] origin-center scale-x-0 rounded-full opacity-0 transition-all duration-300 ease-out group-hover:scale-x-100 group-hover:opacity-100"
                  style={{
                    background: ROSE,
                    boxShadow: `0 0 8px ${ROSE}B3, 0 0 14px ${ROSE}66`,
                  }}
                />
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                {link.hint}
                <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          ))}

          <div className="my-2 h-px bg-rose-100" />

          {isAuthenticated ? (
            <NavbarAuth isMobile onAfterAction={() => setIsMenuOpen(false)} />
          ) : (
            <>
              <p className="px-3 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Account
              </p>
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-[10px] px-3 py-2.5 text-[14px] font-semibold text-slate-900 transition-colors hover:bg-rose-100/60 hover:text-[#D81B60]"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between gap-2 rounded-[10px] px-4 py-2.5 text-[14px] font-semibold text-white shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${ROSE} 0%, ${ROSE_DARK} 55%, ${ROSE_DEEPER} 100%)`,
                }}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}

          {/* Status strip */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[10px] border border-emerald-100 bg-emerald-50/60 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Status</p>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </p>
            </div>
            <div className="rounded-[10px] border border-rose-100 bg-rose-50/60 px-3 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: ROSE_DARK }}>Local time</p>
              <p className="mt-0.5 font-mono text-[12px] font-bold text-slate-800">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          <a
            href="tel:100"
            className="mt-2 flex items-center justify-between rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Emergency · Police
            </span>
            <span className="font-mono">100</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
