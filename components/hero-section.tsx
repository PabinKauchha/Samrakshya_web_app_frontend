"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, ArrowRight, MapPin, Bell, Video, Loader2, Phone, Sparkles, Users, BadgeCheck } from "lucide-react"
import { WomanSilhouette } from "@/components/woman-silhouette"
import { triggerSOS } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/components/auth/auth-provider"

export function HeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [sosPending, setSosPending] = useState(false)

  const handleSOS = useCallback(async () => {
    const token = localStorage.getItem("token");

if (!token) {
  router.push("/login");
  return;
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
const res = await triggerSOS(latitude, longitude);

const sosId = res.data?.sosId; // correct

if (sosId) {
  localStorage.setItem("activeSosId", sosId);
  console.log("Saved SOS ID:", sosId);
  router.push("/dashboard");
} else {
  console.error("SOS ID NOT FOUND", res);
}

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
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32" style={{ minHeight: "100svh" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.25),transparent_36%),linear-gradient(180deg,rgba(253,242,248,1),rgba(252,231,243,0.98)_36%,rgba(253,242,248,1)_88%)]" />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[-120px] top-28 h-80 w-80 rounded-full bg-pink-300/30 blur-3xl" />
        <div className="absolute right-[-100px] top-20 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <WomanSilhouette />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="text-center lg:text-left">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/85 px-4 py-2 text-foreground/80 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm">Modern safety support for everyday confidence</span>
              </div>

              <h1 className="mb-6 text-4xl font-black leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
                Stay connected, protected, and ready in every moment.
              </h1>

              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-foreground/70 lg:mx-0 lg:text-xl">
                Samrakshya brings emergency response, trusted contact alerts, location sharing,
                and incident reporting into one calm, professional safety experience.
              </p>

              <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                {isAuthenticated ? (
                  <Button size="lg" className="h-12 w-full gap-2 rounded-2xl bg-white text-primary shadow-xl shadow-primary/20 hover:bg-white/90 sm:w-auto" asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button size="lg" className="h-12 w-full gap-2 rounded-2xl bg-white text-primary shadow-xl shadow-primary/20 hover:bg-white/90 sm:w-auto" asChild>
                      <Link href="/register">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 w-full gap-2 rounded-2xl border-primary/30 bg-pink-50 text-foreground hover:bg-pink-100 hover:text-foreground sm:w-auto" asChild>
                      <Link href="/login">Log In</Link>
                    </Button>
                  </>
                )}
                <Button variant="outline" size="lg" className="h-12 w-full gap-2 rounded-2xl border-primary/30 bg-pink-50 text-foreground hover:bg-pink-100 hover:text-foreground sm:w-auto" asChild>
                  <Link href="/report">
                    <Video className="w-4 h-4" />
                    Report Incident
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/65 lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-300" />
                  Rapid SOS assistance
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-cyan-300" />
                  Live location sharing
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-violet-300" />
                  Trusted contact management
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-fuchsia-500/25 via-primary/20 to-cyan-400/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-pink-50/90 p-6 shadow-2xl shadow-primary/10 backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Safety Command</p>
                    <h3 className="mt-2 text-2xl font-black text-foreground">Emergency readiness</h3>
                  </div>
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    Status: Ready
                  </div>
                </div>

                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Bell, title: "Instant Alerts", value: "All trusted contacts" },
                    { icon: MapPin, title: "Location", value: "GPS-linked response" },
                    { icon: Video, title: "Reports", value: "Evidence capture flow" },
                  ].map(({ icon: Icon, title, value }) => (
                    <div key={title} className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-foreground/60">{value}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSOS}
                  disabled={sosPending}
                  aria-label="Send SOS emergency alert"
                  className="group relative mb-4 w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-r from-red-500 to-rose-700 px-6 py-5 text-left shadow-xl shadow-red-950/35 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.985] disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-2 ring-red-300/40 animate-pulse" />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                      {sosPending ? <Loader2 className="h-7 w-7 animate-spin text-white" /> : <Phone className="h-7 w-7 text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-red-100/80">Emergency Action</p>
                      <p className="text-2xl font-black leading-none text-white">{sosPending ? "Alerting..." : "Send SOS"}</p>
                      <p className="mt-1 text-xs text-red-50/80">
                        {sosPending ? "Fetching your live location and notifying contacts" : "Notify all emergency contacts instantly"}
                      </p>
                    </div>
                    {!sosPending && <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-white/65 transition-all group-hover:translate-x-0.5 group-hover:text-white" />}
                  </div>
                </button>

                <p className="text-xs text-foreground/55">
                  The app uses your current GPS location to support faster, clearer emergency responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
