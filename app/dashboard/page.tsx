"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, AlertTriangle, CheckCircle, Clock, MapPin, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { triggerSOS, confirmSOS, getSOSHistory, type SOSEvent } from "@/lib/api"

export default function DashboardPage() {
  const [email, setEmail] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [triggerLoading, setTriggerLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [locationLink, setLocationLink] = useState<string | null>(null)

  const [history, setHistory] = useState<SOSEvent[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("samrakshya_email")
    if (saved) setEmail(saved)
    loadHistory()
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const data = await getSOSHistory()
      setHistory(data)
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
      const res = await triggerSOS(email, lat, lng)
      setLocationLink(res.location)
      toast.success(res.message)
      loadHistory()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to trigger SOS.")
    } finally {
      setTriggerLoading(false)
    }
  }

  async function handleConfirm() {
    setConfirmLoading(true)
    try {
      await confirmSOS()
      toast.success("SOS confirmed. Escalation stopped.")
      loadHistory()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to confirm SOS.")
    } finally {
      setConfirmLoading(false)
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-foreground">Samrakshya</span>
          </Link>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">{email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SOS Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage emergency alerts and view SOS history.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* ── Trigger SOS ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Trigger SOS Alert
              </CardTitle>
              <CardDescription>
                Send an emergency alert with your current location to all emergency contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTrigger} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sos-email">Your email</Label>
                  <Input
                    id="sos-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="27.7172"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="85.3140"
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
                    View location on Google Maps
                  </a>
                )}

                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={triggerLoading}
                >
                  {triggerLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Triggering…</>
                  ) : (
                    <><AlertTriangle className="w-4 h-4" /> Trigger SOS</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* ── Confirm SOS ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                Confirm SOS
              </CardTitle>
              <CardDescription>
                Stop the active SOS escalation. All active alerts will be marked as confirmed.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Use this when the situation is resolved and you want to stop further escalation to emergency contacts.
              </p>
              <Button
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600"
              >
                {confirmLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Confirm &amp; Stop Escalation</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── SOS History ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                SOS History
              </CardTitle>
              <CardDescription>All past SOS events, most recent first.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadHistory} disabled={historyLoading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${historyLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No SOS events recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Email</th>
                      <th className="pb-2 pr-4 font-medium">Status</th>
                      <th className="pb-2 pr-4 font-medium">Location</th>
                      <th className="pb-2 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((event) => (
                      <tr key={event._id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 text-foreground">{event.email}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={event.status === "active" ? "destructive" : "secondary"}
                          >
                            {event.status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <a
                            href={event.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <MapPin className="w-3 h-3 shrink-0" />
                            {event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}
                          </a>
                        </td>
                        <td className="py-3 text-muted-foreground whitespace-nowrap">
                          {formatTime(event.time)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
