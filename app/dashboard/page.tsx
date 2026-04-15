"use client";

import { deleteContact } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cancelSOS } from "@/lib/api"; // or your correct path
import Link from "next/link"
import {
  Shield, AlertTriangle, CheckCircle, Clock, MapPin,
  Loader2, RefreshCw, Phone, UserPlus, Activity, Users, TrendingUp,
  Video, FileVideo, ExternalLink,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  triggerSOS, confirmSOS, getSOSHistory, getUserProfile, addContact, getIncidents,
  type SOSEvent, type EmergencyContact, type Incident,
} from "@/lib/api"
import { getActiveSOS } from "@/lib/api";
// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [relationship, setRelationship] = useState("");

  // SOS state
  const [activeSosId, setActiveSosId] = useState<string | null>(null);
  const [latitude,       setLatitude]       = useState("")
  const [longitude,      setLongitude]      = useState("")
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [locationLink,   setLocationLink]   = useState<string | null>(null)
const [locationInterval, setLocationInterval] = useState<NodeJS.Timeout | null>(null);

  // History
  const [history,        setHistory]        = useState<SOSEvent[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Contacts
 const [contacts, setContacts] = useState<any[]>([])
  const [contactsLoading,  setContactsLoading]  = useState(true)
  const [newName,          setNewName]          = useState("")
  const [newPhone,         setNewPhone]         = useState("")
  const [addingContact,    setAddingContact]    = useState(false)

  // Incidents
  const [incidents, setIncidents] = useState<any[]>([])
  const [incidentsLoading, setIncidentsLoading] = useState(true)

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Please login first");
    router.replace("/login");
    return;
  }

  async function init() {
    try {
      const res = await getUserProfile();
      const userEmail = res.data.user.email;

      setEmail(userEmail);

      // ✅ LOAD EVERYTHING
      await loadActiveSOS();
      await loadHistory();
      await loadProfile(userEmail);
      await loadIncidents(userEmail);

    } catch (err) {
      console.error("Init failed:", err);
      localStorage.clear();
      router.replace("/login");
    }
  }

  init();
}, []);// ✅ IMPORTANT
async function loadActiveSOS() {
  try {
    const res = await getActiveSOS();

    const active = res.data.activeSos;

    if (active?._id) {
      console.log("ACTIVE SOS FOUND:", res);

      setActiveSosId(active._id);
      localStorage.setItem("activeSosId", active._id);
    } else {
      console.log("No active SOS");
    }
  } catch (err) {
    console.error("Failed to fetch active SOS", err);
  }
}

  async function loadProfile(emailArg: string) {
    setContactsLoading(true)
    try {
   const res = await getUserProfile()
    setContacts(res.data.user.emergencyContacts ?? [])
    } catch {
      // profile may not exist yet — silently ignore
    } finally {
      setContactsLoading(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      setHistory(await getSOSHistory())
    } catch {
      toast.error("Could not load SOS history.")
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleTrigger(e: React.FormEvent) {
    e.preventDefault()
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude values.")
      return
    }
    setTriggerLoading(true)
    setLocationLink(null)
    try {
const res = await triggerSOS(lat, lng);

console.log("SOS RESPONSE:", res);

const sosId = res.data?.sosId;

if (sosId) {
  localStorage.setItem("activeSosId", sosId);
  setActiveSosId(sosId);
  console.log("Saved SOS ID:", sosId);

  const interval = setInterval(() => {
    sendLocationUpdate(sosId);
  }, 20000);
  setLocationInterval(interval);
} else {
  console.error("SOS ID NOT FOUND", res);
}

setLocationLink(res.data.location);
      toast.success("Sos ALert sent sucessfully")
      loadHistory()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger SOS.")
    } finally {
      setTriggerLoading(false)
    }
  }

const handleConfirm = async () => {
  try {
    setConfirmLoading(true);

    let sosId = activeSosId || localStorage.getItem("activeSosId");

    if (!sosId) {
      const res = await getActiveSOS();
      sosId = res.data?.activeSos?._id;
    }

    if (!sosId) {
      console.error("No active SOS ID");
      return;
    }

   await cancelSOS(sosId);

if (locationInterval) {
  clearInterval(locationInterval);
  setLocationInterval(null);
}
localStorage.removeItem("activeSosId");
setActiveSosId(null);

  } catch (err) {
    console.error(err);
  } finally {
    setConfirmLoading(false);
  }
};

async function sendLocationUpdate(sosId: string) {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude: lat, longitude: lng } = pos.coords;
    try {
      await fetch("http://localhost:4321/api/sos/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ lat, lng }),
      });
      console.log("📍 Location updated:", lat, lng);
    } catch (err) {
      console.error("Location update failed:", err);
    }
  });
}

async function loadIncidents(emailArg: string) {
  setIncidentsLoading(true)
  try {
    const res = await getIncidents(emailArg)
    setIncidents(Array.isArray(res) ? res : [])
  } catch {
    setIncidents([])
  } finally {
    setIncidentsLoading(false)
  }
  try {
    const res = await getIncidents(emailArg)

    // ✅ ALWAYS force array
    setIncidents(Array.isArray(res) ? res : [])
  } catch {
    setIncidents([]) // fallback
  } finally {
    setIncidentsLoading(false)
  }
}
type AddContactResponse = {
  success: boolean;
  message: string;
  data: {
    emergencyContact: EmergencyContact;
  };
};

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newPhone.trim()) return
    setAddingContact(true)
    try {
const res = await addContact({
  name: newName.trim(),
  phone: newPhone.trim(),
  relationship
});
setContacts(prev => [
  ...prev,
  ...(res.data?.emergencyContact ? [res.data.emergencyContact] : [])
]);
      setNewName("")
      setNewPhone("")
      toast.success("Emergency contact added.")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to add contact.")
    } finally {
      setAddingContact(false)
    }
  }

  // derived stats
  const totalSOS      = history.length
  const activeSOS     = history.filter(e => e.status === "active").length
  const confirmedSOS  = history.filter(e => e.status === "confirmed").length
  const contactCount = contacts?.length || 0
  const incidentCount = incidents.length

  const stats = [
    { label: "Total SOS",  value: totalSOS,      icon: Activity,      color: "text-primary"     },
    { label: "Active",     value: activeSOS,      icon: AlertTriangle, color: "text-destructive" },
    { label: "Confirmed",  value: confirmedSOS,   icon: TrendingUp,    color: "text-green-600 dark:text-green-400" },
    { label: "Contacts",   value: contactCount,   icon: Users,         color: "text-blue-600 dark:text-blue-400"  },
    { label: "Incidents",  value: incidentCount,  icon: FileVideo,     color: "text-violet-600 dark:text-violet-400" },
  ]

    console.log("INCIDENTS:", incidents)

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Samrakshya</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {email || "Not signed in"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadHistory}
              disabled={historyLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">SOS Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor alerts, manage emergency contacts, and stay protected.
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted/60 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  {historyLoading || contactsLoading || incidentsLoading ? (
                    <Skeleton className="h-6 w-8 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Main 2-col grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Left: SOS Actions ── */}
          <div className="flex flex-col gap-6">

            {/* Trigger SOS */}
            <Card className="border border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Trigger SOS Alert
                </CardTitle>
                <CardDescription>
                  Send an emergency alert with your GPS location to all saved contacts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrigger} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="sos-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Account email
                    </Label>
                    <Input
                      id="sos-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lat" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Latitude
                      </Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={e => setLatitude(e.target.value)}
                        placeholder="27.7172"
                        className="h-10"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lng" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Longitude
                      </Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={e => setLongitude(e.target.value)}
                        placeholder="85.3140"
                        className="h-10"
                        required
                      />
                    </div>
                  </div>

                  {locationLink && (
                    <a
                      href={locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <MapPin className="w-4 h-4 shrink-0" />
                      View on Google Maps
                    </a>
                  )}

                  <Button
                    type="submit"
                    variant="destructive"
                    size="lg"
                    className="w-full gap-2 h-12 text-base font-semibold"
                    disabled={triggerLoading}
                  >
                    {triggerLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Sending alert…</>
                    ) : (
                      <><AlertTriangle className="w-5 h-5" /> Trigger SOS</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Confirm SOS */}
            <Card className="border border-border/60 bg-muted/20">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950 shrink-0 mt-0.5">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">Safe? Confirm &amp; stop escalation</p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    Marks all active alerts as resolved and stops contact notifications.
                  </p>
                  <Button
                    onClick={handleConfirm}
                    disabled={confirmLoading}
                    size="sm"
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
                  >
                    {confirmLoading ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Confirming…</>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5" /> I&apos;m Safe</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* ── Right: Emergency Contacts ── */}
          <Card className="border border-border/60 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Emergency Contacts
              </CardTitle>
              <CardDescription>
                These people are alerted when you trigger SOS.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 flex-1">

              {/* Contact list */}
              <div className="flex-1 min-h-0">
                {contactsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No contacts yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add someone below to receive your SOS alerts.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {contacts.map((c, i) => (
                      <li
                    
                        key={c._id ?? i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/50"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold text-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            {c.phone || c.phoneNumber || "No number"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          #{i + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
  <Badge variant="secondary" className="text-xs">
    #{i + 1}
  </Badge>

  <button
    onClick={async () => {
      try {
        await deleteContact(c._id);
        setContacts(prev => prev.filter(item => item._id !== c._id));
        toast.success("Contact deleted");
      } catch (err) {
        toast.error("Failed to delete");
      }
    }}
    className="text-xs text-red-500 hover:underline"
  >
    Delete
  </button>
</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Separator />

              {/* Add contact form */}
              <form onSubmit={handleAddContact} className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" /> Add New Contact
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Full name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="h-9 text-sm"
                    required
                  />
                  <Input
                    placeholder="+977 98XXXXXXXX"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="h-9 text-sm"
                    required
                  />
                </div>
                <select
  value={relationship}
  onChange={(e) => setRelationship(e.target.value)}
>
<option value="friend">Friend</option>
<option value="parent">Parent</option>
<option value="sibling">Sibling</option>
<option value="child">Child</option>
<option value="relative">Relative</option>
<option value="neighbor">Neighbor</option>
<option value="coworker">Coworker</option>
</select>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  disabled={addingContact || !newName.trim() || !newPhone.trim()}
                >
                  {addingContact ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" /> Add Contact</>
                  )}
                </Button>
              
              </form>

            </CardContent>
          </Card>
        </div>

        {/* ── SOS History ── */}
        <Card className="border border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  SOS History
                </CardTitle>
                <CardDescription className="mt-1">
                  All past alerts — most recent first.
                </CardDescription>
              </div>
              {activeSOS > 0 && (
                <Badge variant="destructive" className="shrink-0 animate-pulse">
                  {activeSOS} active
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No SOS events yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Triggered alerts will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pl-1 pr-4">
                        Email
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-4">
                        Location
                      </th>
                      <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-3 pr-1">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {history.map(event => (
                      <tr key={event._id} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 pl-1 pr-4 text-foreground font-medium truncate max-w-[160px]">
                          {event.email}
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge
                            variant={event.status === "active" ? "destructive" : "secondary"}
                            className={event.status === "active" ? "animate-pulse" : ""}
                          >
                            {event.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 pr-4">
                          <a
                            href={event.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                          </a>
                        </td>
                        <td className="py-3.5 pr-1 text-muted-foreground whitespace-nowrap">
                          <span title={fullDate(event.time)}>
                            {relativeTime(event.time)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Incident Reports ── */}
        <Card className="border border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-violet-500" />
                  Incident Reports
                </CardTitle>
                <CardDescription className="mt-1">
                  Video evidence you have submitted — most recent first.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-2 shrink-0" asChild>
                <Link href="/report">
                  <Video className="w-3.5 h-3.5" />
                  New Report
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {incidentsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : incidents.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <FileVideo className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No incident reports yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  Record or upload video evidence of an incident to keep it on file.
                </p>
                <Button size="sm" variant="outline" className="gap-2" asChild>
                  <Link href="/report">
                    <Video className="w-3.5 h-3.5" />
                    Report an Incident
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {incidents.map((inc) => (
                  <li
                    key={inc._id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <FileVideo className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                        {inc.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {relativeTime(inc.createdAt)}
                        <span className="mx-1">·</span>
                        <span title={fullDate(inc.createdAt)}>{fullDate(inc.createdAt)}</span>
                      </p>
                    </div>
                    <a
                      href={inc.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
