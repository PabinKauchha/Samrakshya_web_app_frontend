"use client";

import { deleteContact } from "@/lib/api";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { cancelSOS } from "@/lib/api";
import Link from "next/link"
import {
  HeartHandshake, AlertTriangle, CheckCircle, Clock, MapPin,
  Loader2, RefreshCw, Phone, UserPlus, Activity, Users, TrendingUp,
  Video, FileVideo, ExternalLink, LayoutDashboard, Bell,
  LogOut, Settings, BookOpen, Menu, X, Trash2, ChevronRight,
  Siren, WifiOff, Navigation, Map, LifeBuoy, Send, PlusCircle,
  MessageCircle, Home, ChevronDown,BarChart2
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  triggerSOS, getSOSHistory, getUserProfile, addContact, getIncidents,
  type SOSEvent,
} from "@/lib/api"
import { getActiveSOS } from "@/lib/api";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return "just now"
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function fullDate(iso: string) {
  return new Date(iso).toLocaleString()
}


function getInitials(value: string) {
  if (!value) return "SA"
  const cleaned = value.split("@")[0]
  const parts = cleaned.split(/[.\s_-]+/).filter(Boolean)
  return (parts[0]?.[0] || cleaned[0] || "S").toUpperCase() + (parts[1]?.[0] || "").toUpperCase()
}

// ────────────────────────────────────────────────────────────────
// SOS Emergency Overlay
// ────────────────────────────────────────────────────────────────
function SOSEmergencyOverlay({
  onConfirmSafe, confirmLoading, locationLink, contacts,
}: {
  onConfirmSafe: () => void
  confirmLoading: boolean
  locationLink: string | null
  contacts: any[]
}) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const fmtElapsed = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-y-auto"
      style={{
        background: "radial-gradient(circle at top, rgba(248,113,113,0.18), transparent 28%), linear-gradient(160deg, #140202 0%, #3b0404 38%, #170303 100%)",
        animation: "bg-pulse 3s ease-in-out infinite",
      }}>

      {/* Subtle vignette pulse */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ animation: "sos-vignette 2s ease-in-out infinite" }}>
        <div className="absolute inset-0 bg-red-900/30 rounded-none" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,100,100,0.8) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />

      {/* ── Top Emergency Bar ── */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-red-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-700/40 border border-red-500/40 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-red-300" />
          </div>
          <span className="font-extrabold text-red-100 tracking-tight">Samrakshya</span>
        </div>
        {/* Elapsed timer */}
        <div className="flex items-center gap-2 bg-red-900/60 border border-red-700/50 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-200 text-xs font-mono font-bold tracking-wider">ALERT ACTIVE · {fmtElapsed(elapsed)}</span>
        </div>
      </div>

      {/* ── Main emergency content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8">

        {/* Emergency badge */}
        <div className="flex items-center gap-3 bg-red-900/50 border border-red-600/50 rounded-2xl px-6 py-3 backdrop-blur-sm">
          <Siren className="w-5 h-5 text-red-400 animate-pulse" />
          <span className="text-red-200 font-bold text-sm uppercase tracking-wider">Emergency Mode Active</span>
          <Siren className="w-5 h-5 text-red-400 animate-pulse" />
        </div>

        {/* Big SOS indicator */}
        <div className="relative flex items-center justify-center">
          {/* Rings */}
          <span className="absolute w-56 h-56 rounded-full border-2 border-red-500/30 animate-ping" />
          <span className="absolute w-44 h-44 rounded-full border-2 border-red-500/50 animate-ping" style={{ animationDelay: "0.5s" }} />

          <div className="relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-1 shadow-[0_0_80px_rgba(239,68,68,0.6)]"
            style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" }}>
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-red-400/10 animate-pulse" />
            <Siren className="w-10 h-10 text-white relative z-10" strokeWidth={1.5} />
            <span className="text-white font-black text-xl leading-none relative z-10">SOS</span>
            <span className="text-red-200 text-[9px] font-bold uppercase tracking-[0.2em] relative z-10">ACTIVE</span>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
          {[
            {
              icon: Bell, label: "Alert Sent",
              desc: `To ${contacts.length} contact${contacts.length !== 1 ? "s" : ""}`,
              color: "text-red-300", bg: "bg-red-900/40 border-red-700/50",
            },
            {
              icon: Navigation, label: "Location Shared",
              desc: "GPS active & updating",
              color: "text-orange-300", bg: "bg-orange-900/30 border-orange-700/40",
            },
            {
              icon: Phone, label: "Contacts Notified",
              desc: "Via SMS & app",
              color: "text-rose-300", bg: "bg-rose-900/30 border-rose-700/40",
            },
          ].map(({ icon: Icon, label, desc, color, bg }) => (
            <div key={label} className={`flex flex-col gap-2 p-4 rounded-2xl border backdrop-blur-sm ${bg}`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className={`text-xs font-bold ${color} uppercase tracking-wide`}>{label}</span>
              </div>
              <p className="text-red-300/70 text-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* Location link */}
        {locationLink && (
          <a href={locationLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-red-300 hover:text-red-100 underline underline-offset-4 transition-colors">
            <MapPin className="w-4 h-4" /> View my live location
          </a>
        )}

        {/* Actions */}
        <div className="grid w-full max-w-3xl gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-red-700/50 bg-red-950/35 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300/70">Live response</p>
            <h3 className="mt-3 text-2xl font-black text-white">Emergency Mode Active</h3>
            <p className="mt-3 text-sm leading-6 text-red-100/70">
              Alerts are active, contacts are being notified, and your shared location is ready for responders.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200">Alert dispatch</span>
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200">Location sharing</span>
              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200">Contact escalation</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirmSafe}
              disabled={confirmLoading}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-lg transition-all active:scale-95 disabled:opacity-60 shadow-2xl shadow-emerald-900/50"
            >
              {confirmLoading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <CheckCircle className="w-5 h-5" />}
              {confirmLoading ? "Cancelling…" : "I'm Safe — Cancel Alert"}
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-200/60">Current phase</p>
              <p className="mt-2 text-sm text-red-50/80">Stay in a safe place until you confirm the alert can be cancelled.</p>
            </div>
          </div>
        </div>

        <p className="text-red-400/60 text-xs text-center max-w-sm">
          Tap &ldquo;I&apos;m Safe&rdquo; once you are in a safe location to cancel all active alerts and notify your contacts.
        </p>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes sos-vignette {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes bg-pulse {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────
// Main Dashboard
// ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail]               = useState("")
  const [relationship, setRelationship] = useState("friend")
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [settingsOpen, setSettingsOpen]   = useState(false)
  const [profileOpen, setProfileOpen]     = useState(false)
  const [now, setNow]                     = useState<Date>(new Date())
  const profileRef = useRef<HTMLDivElement | null>(null)

  // SOS
  const [activeSosId,      setActiveSosId]      = useState<string | null>(null)
  const [sosJustTriggered, setSosJustTriggered] = useState(false)
  const [latitude,         setLatitude]         = useState("")
  const [longitude,        setLongitude]        = useState("")
  const [triggerLoading,   setTriggerLoading]   = useState(false)
  const [confirmLoading,   setConfirmLoading]   = useState(false)
  const [locationLink,     setLocationLink]     = useState<string | null>(null)
  const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null)

  // History / contacts / incidents
  const [history,          setHistory]          = useState<SOSEvent[]>([])
  const [historyLoading,   setHistoryLoading]   = useState(true)
  const [contacts,         setContacts]         = useState<any[]>([])
  const [contactsLoading,  setContactsLoading]  = useState(true)
  const [newName,          setNewName]          = useState("")
  const [newPhone,         setNewPhone]         = useState("")
  const [phoneError,       setPhoneError]       = useState("")
  const [addingContact,    setAddingContact]    = useState(false)
  const [incidents,        setIncidents]        = useState<any[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)

  // Is emergency mode active?
  const emergencyActive = !!(activeSosId || (history.filter(e => e.status === "active").length > 0 && sosJustTriggered))

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { toast.error("Please login first"); router.replace("/login"); return }

    async function init() {
      try {
        const res = await getUserProfile()
        const userEmail = res.data.user.email
        setEmail(userEmail)
        await loadActiveSOS()
        await loadHistory()
        await loadProfile()
        await loadIncidents(userEmail)
         } catch (err) {
    console.error("Init error:", err)
    }
    }
    init()
  }, [])

  async function loadActiveSOS() {
    try {
      const res = await getActiveSOS()
      const active = res.data.activeSos
      if (active?._id) {
        setActiveSosId(active._id)
        localStorage.setItem("activeSosId", active._id)
      } else {
        // Backend reports no active SOS. If the client still thinks one is active,
        // the admin (or the user on another device) must have resolved it.
        setActiveSosId(prev => {
          if (prev) {
            localStorage.removeItem("activeSosId")
            if (locationInterval) {
              clearInterval(locationInterval)
              setLocationInterval(null)
            }
            toast.success("Your emergency has been marked resolved by the response team.")
          }
          return null
        })
        setSosJustTriggered(false)
      }
    } catch {}
  }

  // Poll the backend for SOS status so admin-side resolution ends emergency mode here too.
  useEffect(() => {
    const id = setInterval(() => { loadActiveSOS() }, 8000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationInterval])

  // Live clock (updates once a minute, cheap)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Click-away + Escape for profile dropdown
  useEffect(() => {
    if (!profileOpen) return
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setProfileOpen(false) }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [profileOpen])

  async function loadProfile() {
    setContactsLoading(true)
    try { const res = await getUserProfile(); setContacts(res.data.user.emergencyContacts ?? []) }
    catch {} finally { setContactsLoading(false) }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    try { setHistory(await getSOSHistory()) }
    catch { toast.error("Could not load SOS history.") }
    finally { setHistoryLoading(false) }
  }

  // ── SOS Trigger ──
  const handleQuickSOS = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) { router.push("/login"); return }

    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return }

    setTriggerLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await triggerSOS(pos.coords.latitude, pos.coords.longitude)
          const sosId = res.data?.sosId
          if (sosId) {
            localStorage.setItem("activeSosId", sosId); setActiveSosId(sosId)
            const interval = setInterval(() => sendLocationUpdate(sosId), 20000)
            setLocationInterval(interval)
          }
          setLocationLink(res.data?.location ?? null)
          setSosJustTriggered(true)
          toast.success("SOS alert sent to all emergency contacts!")
          loadHistory()
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to trigger SOS.")
        } finally { setTriggerLoading(false) }
      },
      () => { toast.error("Location access denied."); setTriggerLoading(false) },
      { timeout: 10000 }
    )
  }, [router])

  async function handleTrigger(e: React.FormEvent) {
    e.preventDefault()
    const lat = parseFloat(latitude), lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng)) { toast.error("Enter valid lat/lng values."); return }
    setTriggerLoading(true); setLocationLink(null)
    try {
      const res = await triggerSOS(lat, lng)
      const sosId = res.data?.sosId
      if (sosId) {
        localStorage.setItem("activeSosId", sosId); setActiveSosId(sosId)
        const interval = setInterval(() => sendLocationUpdate(sosId), 20000)
        setLocationInterval(interval)
      }
      setLocationLink(res.data?.location ?? null)
      setSosJustTriggered(true)
      toast.success("SOS Alert sent successfully")
      loadHistory()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger SOS.")
    } finally { setTriggerLoading(false) }
  }

  const handleConfirm = async () => {
    try {
      setConfirmLoading(true)
      let sosId = activeSosId || localStorage.getItem("activeSosId")
      if (!sosId) { const res = await getActiveSOS(); sosId = res.data?.activeSos?._id }
      if (!sosId) return
      await cancelSOS(sosId)
      if (locationInterval) { clearInterval(locationInterval); setLocationInterval(null) }
      localStorage.removeItem("activeSosId")
      setActiveSosId(null)
      setSosJustTriggered(false)
      setLocationLink(null)
      toast.success("Alert cancelled. You're now marked as safe.")
      loadHistory()
    } catch (err) { console.error(err) }
    finally { setConfirmLoading(false) }
  }

  async function sendLocationUpdate(sosId: string) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await fetch("http://localhost:4321/api/sos/location", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        })
      } catch {}
    })
  }

  async function loadIncidents(emailArg: string) {
    setIncidentsLoading(true)
    try { const res = await getIncidents(emailArg); setIncidents(Array.isArray(res) ? res : []) }
    catch { setIncidents([]) }
    finally { setIncidentsLoading(false) }
  }

  const PHONE_REGEX = /^98\d{8}$/

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) return
    if (!PHONE_REGEX.test(newPhone.trim())) {
      setPhoneError("Phone must start with 98 and be exactly 10 digits.")
      return
    }
    setPhoneError("")
    setAddingContact(true)
    try {
      const res = await addContact({ name: newName.trim(), phone: newPhone.trim(), relationship })
      setContacts(prev => [...prev, ...(res.data?.emergencyContact ? [res.data.emergencyContact] : [])])
      setNewName(""); setNewPhone("")
      toast.success("Emergency contact added.")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add contact.")
    } finally { setAddingContact(false) }
  }

  function handleSignOut() { localStorage.clear(); router.push("/") }

  // Derived
  const totalSOS      = history.length
  const activeSOS     = history.filter(e => e.status === "active").length
  const confirmedSOS  = history.filter(e => e.status === "confirmed").length
  const contactCount  = contacts?.length || 0
  const incidentCount = incidents.length
  const currentStatus = emergencyActive ? "Alert" : "Safe"
  const currentLocationLabel = locationLink ? "Live location sharing active" : "Location becomes visible during SOS sharing"
  const userInitials = getInitials(email)

  const scrollToContacts = () => {
    document.getElementById("contacts-section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    setSidebarOpen(false)
  }

  type NavItem = {
    icon: React.ElementType
    label: string
    active?: boolean
  } & ({ href: string; onClick?: never } | { onClick: () => void; href?: never })

  const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Bell,            label: "SOS",       onClick: () => { handleQuickSOS(); setSidebarOpen(false) } },
    { icon: Users,           label: "Contacts",  onClick: scrollToContacts },
    { icon: FileVideo,       label: "Reports",   href: "/report" },
    { icon: MessageCircle,   label: "Problems",  href: "/problems" },
    { icon: BookOpen,        label: "Resources", href: "/resources" },
    { icon: BarChart2, label: "Analysis", href: "/analysis" },
  ]

  const statsCards = [
    { label: "Total SOS",  value: totalSOS,      icon: Activity,      gradient: "from-primary to-[oklch(0.48_0.22_330)]", iconBg: "bg-primary/10", iconColor: "text-primary" },
    { label: "Active",     value: activeSOS,      icon: AlertTriangle, gradient: "from-red-500 to-rose-600",               iconBg: "bg-red-50",     iconColor: "text-red-500"     },
    { label: "Resolved",   value: confirmedSOS,   icon: TrendingUp,    gradient: "from-emerald-500 to-teal-600",           iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "Contacts",   value: contactCount,   icon: Users,         gradient: "from-blue-500 to-cyan-500",              iconBg: "bg-blue-50",    iconColor: "text-blue-500"    },
    { label: "Incidents",  value: incidentCount,  icon: FileVideo,     gradient: "from-violet-500 to-purple-600",          iconBg: "bg-violet-50",  iconColor: "text-violet-500"  },
  ]

  const featureCards = [
    {
      title: "Send SOS",
      description: "Trigger emergency alerts to all trusted contacts instantly.",
      icon: Bell,
      action: () => handleQuickSOS(),
      cta: triggerLoading ? "Sending..." : "Activate",
      accent: "from-red-500 to-rose-600",
      iconWrap: "bg-red-50 text-red-500",
    },
    {
      title: "Share Location",
      description: "Open the shared location link whenever live sharing is active.",
      icon: MapPin,
      href: locationLink || undefined,
      cta: locationLink ? "Open map" : "Waiting",
      accent: "from-sky-500 to-cyan-500",
      iconWrap: "bg-sky-50 text-sky-500",
    },
    {
      title: "Add Contacts",
      description: "Keep your trusted emergency circle ready for rapid response.",
      icon: PlusCircle,
      action: () => {
        const target = document.getElementById("contacts-section")
        target?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
      cta: "Manage",
      accent: "from-violet-500 to-purple-600",
      iconWrap: "bg-violet-50 text-violet-500",
    },
    {
      title: "Report Incident",
      description: "Capture evidence and keep incident records organized.",
      icon: Video,
      href: "/report",
      cta: "Report",
      accent: "from-fuchsia-500 to-pink-600",
      iconWrap: "bg-fuchsia-50 text-fuchsia-500",
    },
    {
      title: "Share a Problem",
      description: "Report an issue or ask admin a question — replies land right here.",
      icon: MessageCircle,
      href: "/problems",
      cta: "Open",
      accent: "from-rose-500 to-pink-700",
      iconWrap: "bg-rose-50 text-rose-600",
    },
    {
      title: "Safety Tips",
      description: "Review practical resources and support guidance quickly.",
      icon: LifeBuoy,
      href: "/",
      cta: "Explore",
      accent: "from-emerald-500 to-teal-600",
      iconWrap: "bg-emerald-50 text-emerald-600",
    },
  ]

  // ── Render emergency overlay when SOS is active ──
  if (emergencyActive) {
    return (
      <SOSEmergencyOverlay
        onConfirmSafe={handleConfirm}
        confirmLoading={confirmLoading}
        locationLink={locationLink}
        contacts={contacts}
      />
    )
  }

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
          {/* Logo */}
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

          {/* User status chip */}
          <div className="px-4 py-4 border-b border-border shrink-0">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-emerald-700">Status: {currentStatus}</p>
                  <p className="text-[10px] text-emerald-600/70 truncate">{email || "—"}</p>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[11px] text-emerald-700/80">
                {contactCount} trusted contact{contactCount === 1 ? "" : "s"} connected
                </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ icon: Icon, label, href, onClick, active }) => {
              const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`
              const inner = (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : "group-hover:text-foreground"}`} />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />}
                </>
              )
              return href ? (
                <Link key={label} href={href} className={cls}>{inner}</Link>
              ) : (
                <button key={label} type="button" onClick={onClick} className={cls}>{inner}</button>
              )
            })}

            {/* Settings — expandable */}
            <div>
              <button
                type="button"
                onClick={() => setSettingsOpen(v => !v)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group w-full text-left ${
                  settingsOpen
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Settings className="w-4 h-4 shrink-0 group-hover:text-foreground" />
                Settings
                <ChevronRight className={`w-3.5 h-3.5 ml-auto transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`} />
              </button>

              {settingsOpen && (
                <div className="mt-1 ml-3 pl-4 border-l-2 border-border space-y-1">
                  {/* Account info row */}
                  <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-secondary/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-[11px] font-bold text-white shrink-0">
                      {userInitials}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email || "—"}</p>
                  </div>

                  {/* Sign out */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Quick SOS */}
          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={handleQuickSOS}
              disabled={triggerLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60"
            >
              {triggerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              {triggerLoading ? "Sending…" : "Quick SOS"}
            </button>
          </div>
        </aside>
      </>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ═══════════════════════ TOP HEADER (two-tier) ═══════════════════════ */}
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl backdrop-saturate-150 shrink-0 transition-colors ${
            emergencyActive
              ? "border-red-200/70 bg-red-50/85 shadow-[0_10px_30px_-12px_rgba(220,38,38,0.2)]"
              : "border-rose-200/60 bg-[rgba(253,232,240,0.75)] shadow-[0_10px_30px_-12px_rgba(173,20,87,0.18)]"
          }`}
        >
          {/* Ambient mesh */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(900px 100px at 10% -30%, rgba(216,27,96,0.07), transparent 60%), radial-gradient(700px 80px at 90% -20%, rgba(173,20,87,0.06), transparent 60%)",
            }}
          />

          {/* ── Primary row ──────────────────────────────────────────── */}
          <div className="relative flex h-[60px] items-center gap-3 px-4 sm:px-6">
            <button
              className="lg:hidden -ml-1 flex h-9 w-9 items-center justify-center rounded-[10px] text-slate-700 transition-colors hover:bg-rose-50 hover:text-[#AD1457]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb with view meta */}
            <div className="min-w-0 flex flex-col leading-tight">
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-[#AD1457]">
                  <Home className="w-3 h-3" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span style={{ color: "#AD1457" }}>Dashboard</span>
              </nav>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">
                  {emergencyActive ? "Emergency Response" : "Safety Workspace"}
                </h2>
                <span
                  className={`hidden md:inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-[1px] text-[9px] font-bold uppercase tracking-wider ${
                    emergencyActive
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className={`h-1 w-1 rounded-full ${emergencyActive ? "bg-red-500" : "bg-emerald-500"} animate-pulse`} />
                  {emergencyActive ? "Alert" : "Safe"}
                </span>
              </div>
            </div>

            <div className="flex-1" />

            {/* Live clock (HH:MM) */}
            <div className="hidden md:flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white/70 px-2 py-1 font-mono text-[10.5px] tracking-[0.1em] text-slate-600">
              <Clock className="w-3 h-3" />
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>

            {/* Notifications bell */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                aria-label="Recent activity"
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/25 hover:text-[#AD1457]"
              >
                <Bell className="w-3.5 h-3.5" />
                {(activeSOS > 0 || incidentCount > 0) && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D81B60] px-1 text-[9px] font-black text-white shadow-md">
                    {Math.min(99, activeSOS + incidentCount)}
                  </span>
                )}
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadHistory}
              disabled={historyLoading}
              aria-label="Refresh"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/25 hover:text-[#AD1457] disabled:opacity-60 disabled:translate-y-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Report (outlined, desktop) */}
            <Link
              href="/report"
              className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-[10px] border-2 border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-[#AD1457]/30 hover:text-[#AD1457]"
            >
              <Video className="w-3.5 h-3.5" />
              Report
            </Link>

            {/* SOS primary CTA (with glow) */}
            <button
              type="button"
              onClick={handleQuickSOS}
              disabled={triggerLoading}
              className="group relative inline-flex h-9 items-center gap-1.5 overflow-hidden rounded-[10px] px-3 text-[12.5px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:translate-y-0"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 55%, #7f1d1d 100%)",
                boxShadow: "0 8px 22px -8px rgba(185,28,28,0.6)",
              }}
            >
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {triggerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{triggerLoading ? "Sending" : "SOS"}</span>
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </button>

            {/* Divider */}
            <div className="hidden md:block h-7 w-px bg-gradient-to-b from-transparent via-rose-200 to-transparent" />

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(v => !v)}
                className="flex h-9 items-center gap-2 rounded-[10px] border-2 border-slate-200 bg-white pl-1 pr-2 transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/40"
              >
                <span
                  className="relative flex h-7 w-7 items-center justify-center rounded-[8px] text-[11px] font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #D81B60 0%, #AD1457 100%)",
                    boxShadow: "0 4px 12px -4px rgba(173,20,87,0.5)",
                  }}
                >
                  {userInitials}
                  <span
                    aria-hidden
                    className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                      emergencyActive ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
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
                    style={{ background: "linear-gradient(135deg, #D81B60 0%, #AD1457 55%, #880E4F 100%)" }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15 text-[13px] font-bold backdrop-blur-sm">
                      {userInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/75">Signed in as</p>
                      <p className="truncate text-[13px] font-semibold">{email || "—"}</p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-1 border-b border-slate-100 px-2 py-2">
                    <div className="rounded-[8px] bg-emerald-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Contacts</p>
                      <p className="text-[14px] font-black text-emerald-800">{contactCount}</p>
                    </div>
                    <div className="rounded-[8px] bg-rose-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "#AD1457" }}>SOS</p>
                      <p className="text-[14px] font-black" style={{ color: "#AD1457" }}>{totalSOS}</p>
                    </div>
                    <div className="rounded-[8px] bg-violet-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700">Reports</p>
                      <p className="text-[14px] font-black text-violet-800">{incidentCount}</p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link href="/" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <Home className="w-4 h-4" /> Home
                    </Link>
                    <Link href="/report" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <Video className="w-4 h-4" /> Report Incident
                    </Link>
                    <Link href="/problems" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium text-slate-800 transition-colors hover:bg-rose-50 hover:text-[#AD1457]">
                      <MessageCircle className="w-4 h-4" /> Share a Problem
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      type="button"
                      onClick={() => { setProfileOpen(false); handleSignOut() }}
                      className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Context strip (live telemetry) ────────────────────────── */}
          <div className={`relative hidden md:block border-t ${
            emergencyActive ? "border-red-200/60 bg-red-50/70" : "border-rose-100/60 bg-gradient-to-r from-rose-50/40 via-white/40 to-rose-50/40"
          }`}>
            <div className="flex h-9 items-center justify-between gap-4 px-4 sm:px-6 text-[11px] font-semibold">
              {/* Left: contextual chips */}
              <div className="flex items-center gap-2.5 overflow-hidden text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Navigation className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="truncate text-slate-700">{locationLink ? "Location sharing · live" : "Location · standby"}</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Users className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{contactCount} contact{contactCount !== 1 ? "s" : ""}</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5">
                  <Activity className="w-3 h-3" style={{ color: "#AD1457" }} />
                  <span className="text-slate-700">{totalSOS} SOS · {confirmedSOS} resolved</span>
                </span>
              </div>

              {/* Right: health + sync + help */}
              <div className="flex items-center gap-2.5 text-slate-500">
                <span className="hidden lg:inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-700 tracking-wider">connected</span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <span className="inline-flex items-center gap-1">
                  <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} />
                  <span className="font-mono tracking-wider">
                    sync {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                <span className="hidden xl:inline-block h-3 w-px bg-slate-200" />
                <a
                  href="tel:100"
                  className="hidden xl:inline-flex items-center gap-1 font-bold text-red-700 transition-colors hover:text-red-800"
                >
                  <Phone className="w-3 h-3" />
                  Police · 100
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 px-4 sm:px-6 pt-3 pb-6 space-y-6 overflow-y-auto">

          {/* Hero safety panel */}
          <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-950/10 md:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.22),transparent_24%),radial-gradient(circle_at_left,rgba(168,85,247,0.2),transparent_22%)]" />
            <div className="relative z-10 grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  <span className={`h-2 w-2 rounded-full ${emergencyActive ? "bg-red-400" : "bg-emerald-400"} animate-pulse`} />
                  {emergencyActive ? "Alert mode active" : "Normal mode active"}
                </div>
                <h2 className="max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
                  {emergencyActive ? "Emergency mode is active and sharing your response status." : "You are protected with fast access to SOS, contacts, and safety tools."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  Monitor your safety status, access emergency workflows, manage trusted contacts, and keep your recent activity in one clean command center.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Current status</p>
                    <p className={`mt-2 text-lg font-bold ${emergencyActive ? "text-red-300" : "text-emerald-300"}`}>{currentStatus}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Location</p>
                    <p className="mt-2 text-sm font-medium text-white/80">{currentLocationLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">Trusted contacts</p>
                    <p className="mt-2 text-lg font-bold text-white">{contactCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <span className={`absolute inset-0 rounded-full border-2 ${emergencyActive ? "border-red-400/60" : "border-primary/40"} animate-ping scale-110`} />
                  <span className={`absolute inset-0 rounded-full border-2 ${emergencyActive ? "border-red-300/30" : "border-primary/25"} animate-ping scale-125`} style={{ animationDelay: "0.5s" }} />
                  <button
                    onClick={handleQuickSOS}
                    disabled={triggerLoading}
                    aria-label="Trigger SOS"
                    className={`relative flex h-40 w-40 flex-col items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 ${
                      emergencyActive ? "shadow-red-500/50" : "shadow-primary/35"
                    }`}
                    style={{ background: emergencyActive ? "linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 52%, #ec4899 100%)" }}
                  >
                    <div className="absolute inset-2 rounded-full bg-white/10" />
                    {triggerLoading ? <Loader2 className="relative z-10 h-10 w-10 animate-spin" /> : <Phone className="relative z-10 h-10 w-10" strokeWidth={1.5} />}
                    <span className="relative z-10 mt-2 text-2xl font-black leading-none">SOS</span>
                    <span className="relative z-10 mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/75">
                      {emergencyActive ? "Active" : "Emergency"}
                    </span>
                  </button>
                </div>
                <p className="max-w-xs text-center text-xs leading-6 text-white/60">
                  Press the SOS button to alert trusted contacts and start real-time location sharing using your existing emergency flow.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statsCards.map(({ label, value, icon: Icon, gradient, iconBg, iconColor }) => (
              <Card key={label} className="border border-border/60 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  {historyLoading || contactsLoading || incidentsLoading
                    ? <Skeleton className="h-7 w-10 mb-1" />
                    : <p className={`text-3xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent leading-none`}>{value}</p>
                  }
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {featureCards.map((card) => {
              const Icon = card.icon
              const content = (
                <div className="group h-full rounded-[1.75rem] border border-border/60 bg-white/85 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconWrap}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{card.title}</h3>
                  <p className="mt-2 min-h-[64px] text-sm leading-6 text-muted-foreground">{card.description}</p>
                  <div className={`mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold text-white ${card.accent}`}>
                    {card.cta}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              )

              if (card.href) {
                return (
                  <Link key={card.title} href={card.href} className={!locationLink && card.title === "Share Location" ? "pointer-events-none opacity-70" : ""}>
                    {content}
                  </Link>
                )
              }

              return (
                <button key={card.title} type="button" onClick={card.action} className="text-left">
                  {content}
                </button>
              )
            })}
          </div>

          {/* ── Manual SOS + Contacts ── */}
          <div className="grid gap-5 lg:grid-cols-2">

            {/* Manual SOS */}
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  Manual SOS Trigger
                </CardTitle>
                <CardDescription>Enter GPS coordinates to send a precise alert.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrigger} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sos-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account email</Label>
                    <Input id="sos-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" className="h-10 rounded-xl bg-secondary/40" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lat" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latitude</Label>
                      <Input id="lat" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)}
                        placeholder="27.7172" className="h-10 rounded-xl bg-secondary/40" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lng" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Longitude</Label>
                      <Input id="lng" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)}
                        placeholder="85.3140" className="h-10 rounded-xl bg-secondary/40" required />
                    </div>
                  </div>
                  {locationLink && (
                    <a href={locationLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <MapPin className="w-4 h-4 shrink-0" /> View on Google Maps
                    </a>
                  )}
                  <Button type="submit"
                    className="w-full h-11 rounded-xl font-bold gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:opacity-90 shadow-md shadow-red-500/20 text-white"
                    disabled={triggerLoading}>
                    {triggerLoading
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                      : <><AlertTriangle className="w-4 h-4" />Trigger SOS Alert</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card id="contacts-section" className="border border-border/60 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  Emergency Contacts
                  {contactCount > 0 && (
                    <Badge variant="secondary" className="ml-auto rounded-full text-xs">{contactCount}</Badge>
                  )}
                </CardTitle>
                <CardDescription>These people are alerted when you trigger SOS.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1">
                <div className="flex-1 min-h-0">
                  {contactsLoading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
                  ) : contacts.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                        <Users className="w-6 h-6 text-blue-300" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No contacts yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Add someone below to receive your SOS alerts.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {contacts.map((c, i) => (
                        <li key={c._id ?? i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[oklch(0.48_0.22_330)] flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-white font-bold text-sm">{c.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />{c.phone || c.phoneNumber || "No number"}
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              try { await deleteContact(c._id); setContacts(prev => prev.filter(item => item._id !== c._id)); toast.success("Contact deleted") }
                              catch { toast.error("Failed to delete") }
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="h-px bg-border" />

                <form onSubmit={handleAddContact} className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Add New Contact
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Full name" value={newName} onChange={e => setNewName(e.target.value)}
                      className="h-9 text-sm rounded-xl bg-secondary/40" required />
                    <div className="flex flex-col gap-1">
                      <Input
                        placeholder="98XXXXXXXX (must be 10 digits)"
                        value={newPhone}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, "")
                          setNewPhone(digits)
                          if (digits.length > 0 && !/^98/.test(digits))
                            setPhoneError("Must start with 98.")
                          else if (digits.length > 0 && digits.length < 10)
                            setPhoneError("Must be exactly 10 digits.")
                          else
                            setPhoneError("")
                        }}
                        className={`h-9 text-sm rounded-xl bg-secondary/40 ${phoneError ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
                        required
                      />
                      {phoneError && (
                        <p className="text-[11px] text-destructive leading-tight">{phoneError}</p>
                      )}
                    </div>
                  </div>
                  <select value={relationship} onChange={e => setRelationship(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border bg-secondary/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {["friend","parent","sibling","child","relative","neighbor","coworker"].map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <Button type="submit" variant="outline" size="sm"
                    className="w-full gap-2 rounded-xl h-9 font-semibold"
                    disabled={addingContact || !newName.trim() || !newPhone.trim() || !!phoneError}>
                    {addingContact ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Adding…</> : <><UserPlus className="w-3.5 h-3.5" />Add Contact</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Activity and alerts */}
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">SOS History</CardTitle>
                    <CardDescription className="mt-0.5">All past alerts · most recent first</CardDescription>
                  </div>
                </div>
                {activeSOS > 0 && (
                  <Badge variant="destructive" className="rounded-full animate-pulse">{activeSOS} active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No SOS events yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Triggered alerts will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-sm min-w-[540px]">
                    <thead>
                      <tr className="border-b border-border">
                        {["Email","Status","Location","Time"].map(h => (
                          <th key={h} className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider pb-3 pr-4 first:pl-1">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {history.map(event => (
                        <tr key={event._id} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-3 pl-1 pr-4 font-medium text-foreground truncate max-w-[160px]">{event.email}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={event.status === "active" ? "destructive" : "secondary"}
                              className={`rounded-full text-xs ${event.status === "active" ? "animate-pulse" : ""}`}>
                              {event.status}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <a href={event.locationLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-primary hover:underline">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                            </a>
                          </td>
                          <td className="py-3 pr-1 text-muted-foreground whitespace-nowrap">
                            <span title={fullDate(event.time)}>{relativeTime(event.time)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription className="mt-0.5">A visual summary of your latest alerts and records</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: `${totalSOS} SOS events tracked`,
                  body: totalSOS > 0 ? "Your emergency history is available beside this panel for quick review." : "Triggering SOS will start building your emergency timeline.",
                  accent: "bg-primary/10 text-primary",
                  icon: Clock,
                },
                {
                  title: `${contactCount} trusted contact${contactCount === 1 ? "" : "s"}`,
                  body: contactCount > 0 ? "Your safety circle is ready to receive alerts when needed." : "Add emergency contacts to improve readiness.",
                  accent: "bg-blue-50 text-blue-600",
                  icon: Users,
                },
                {
                  title: `${incidentCount} incident report${incidentCount === 1 ? "" : "s"}`,
                  body: incidentCount > 0 ? "Your latest reports stay accessible in one organized feed below." : "Use incident reporting to document evidence when needed.",
                  accent: "bg-violet-50 text-violet-600",
                  icon: FileVideo,
                },
              ].map(({ title, body, accent, icon: Icon }) => (
                <div key={title} className="flex gap-3 rounded-2xl border border-border/60 bg-secondary/20 p-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          </div>

          {/* ── Incident Reports ── */}
          <Card className="border border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Video className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Incident Reports</CardTitle>
                    <CardDescription className="mt-0.5">Video evidence you have submitted</CardDescription>
                  </div>
                </div>
                <Button size="sm" className="gap-2 shrink-0 rounded-xl h-8 text-xs" asChild>
                  <Link href="/report"><Video className="w-3.5 h-3.5" />New Report</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {incidentsLoading ? (
                <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
              ) : incidents.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
                    <FileVideo className="w-6 h-6 text-violet-300" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">No incident reports yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Record or upload video evidence of an incident.</p>
                  <Button size="sm" variant="outline" className="gap-2 rounded-xl" asChild>
                    <Link href="/report"><Video className="w-3.5 h-3.5" />Report an Incident</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {incidents.map((inc) => (
                    <li key={inc._id}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <FileVideo className="w-5 h-5 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-2 mb-1">{inc.description}</p>
                        <p className="text-xs text-muted-foreground">{relativeTime(inc.createdAt)} · {fullDate(inc.createdAt)}</p>
                      </div>
                      <a href={inc.videoUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 mt-1 font-medium">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  )
}
