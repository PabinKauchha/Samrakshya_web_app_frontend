"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, MapPin, Bell, Video, Loader2, Phone } from "lucide-react"
import { WomanSilhouette } from "@/components/woman-silhouette"
import { triggerSOS } from "@/lib/api"
import { toast } from "sonner"

export function HeroSection() {
  const router = useRouter()
  const [sosPending, setSosPending] = useState(false)

  const handleSOS = useCallback(async () => {
    const email = typeof window !== "undefined" ? localStorage.getItem("samrakshya_email") : null

    if (!email) {
      router.push("/login")
      return
    }

    if (!navigator.geolocation) {
      toast.error("Your browser does not support geolocation.")
      return
    }

    setSosPending(true)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          await triggerSOS(email, latitude, longitude)
          toast.success("SOS alert sent! Your emergency contacts have been notified.")
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to send SOS alert.")
        } finally {
          setSosPending(false)
        }
      },
      () => {
        toast.error("Location access denied. Please allow location access and try again.")
        setSosPending(false)
      },
      { timeout: 10000 }
    )
  }, [router])

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32" style={{ minHeight: "100svh" }}>
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <WomanSilhouette />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Your Safety, Our Priority</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
            Safety at every step
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            Samrakshya empowers women with instant emergency alerts, legal guidance on harassment, 
            and mental health support — all in one secure platform designed for your safety.
          </p>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2" asChild>
              <Link href="/report">
                <Video className="w-4 h-4" />
                Report Incident
              </Link>
            </Button>
          </div>

          {/* SOS button */}
          <div className="flex flex-col items-center gap-3 mb-16">
            <button
              onClick={handleSOS}
              disabled={sosPending}
              aria-label="Send SOS emergency alert"
              className="
                group relative w-full max-w-[360px] overflow-hidden rounded-2xl
                bg-red-600 hover:bg-red-500
                px-6 py-5 text-left
                transition-colors duration-150
                active:scale-[0.97]
                disabled:opacity-60 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-background
              "
            >
              {/* slow breathing ring — urgent but not tacky */}
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-red-400/60 animate-pulse" />

              <div className="relative flex items-center gap-4">
                {/* icon */}
                <div className="w-14 h-14 shrink-0 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  {sosPending ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : (
                    <Phone className="w-7 h-7 text-white" />
                  )}
                </div>

                {/* text */}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-red-200 uppercase tracking-[0.14em] mb-0.5">
                    Emergency
                  </p>
                  <p className="text-2xl font-black text-white leading-none tracking-tight">
                    {sosPending ? "Alerting…" : "Send SOS"}
                  </p>
                  <p className="text-xs text-red-100/75 mt-1">
                    {sosPending ? "Getting your location…" : "Notify all emergency contacts instantly"}
                  </p>
                </div>

                {/* arrow */}
                {!sosPending && (
                  <ArrowRight className="ml-auto shrink-0 w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            </button>

            <p className="text-xs text-muted-foreground">
              Your live GPS location is shared the moment you tap
            </p>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">SOS Alerts</h3>
              <p className="text-sm text-muted-foreground">One-tap emergency alerts to your trusted contacts</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Location</h3>
              <p className="text-sm text-muted-foreground">Real-time GPS tracking shared with contacts</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Video Reports</h3>
              <p className="text-sm text-muted-foreground">Record or upload incident evidence securely</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
