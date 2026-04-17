import Link from "next/link"
import { HeartHandshake, CheckCircle2, Sparkles } from "lucide-react"
import { LoginForm } from "@/components/auth/login-form"
import { WomanSilhouette } from "@/components/woman-silhouette"

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen px-4 py-8 sm:px-6 sm:py-10"
      style={{
        background:
          "linear-gradient(135deg, #fbd7e4 0%, #f6bcd0 45%, #edb0c8 100%)",
      }}
    >
      {/* Ambient warmth so the page never reads as flat white */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 15% -10%, rgba(216,27,96,0.18), transparent 55%), radial-gradient(800px 500px at 90% 110%, rgba(173,20,87,0.22), transparent 55%), radial-gradient(600px 420px at 50% 60%, rgba(136,14,79,0.08), transparent 60%)",
        }}
      />
      <div className="relative mx-auto mb-8 flex w-fit items-center gap-2.5 sm:mb-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.62_0.1_340)] shadow-md">
          <HeartHandshake className="h-5 w-5 text-white" />
        </div>
        <Link href="/" className="text-xl font-bold text-foreground">
          Samrakshya
        </Link>
      </div>
      <div className="relative mx-auto max-w-6xl items-stretch gap-6 lg:grid lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
        <div
          className="relative hidden overflow-hidden rounded-[2rem] border border-white/20 p-10 text-white shadow-2xl shadow-rose-900/30 lg:block lg:p-12"
          style={{
            background:
              "linear-gradient(135deg, #ec4899 0%, #D81B60 45%, #AD1457 75%, #880E4F 100%)",
          }}
        >
          <div className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-pink-50/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-56 w-56 rounded-full bg-violet-200/25 blur-3xl" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-100/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.28),transparent_35%),radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.16),transparent_40%)]" />
          <div className="relative">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
              <Sparkles className="h-3.5 w-3.5" />
              Women Safety Platform
            </p>
            <h2 className="mt-4 max-w-md text-4xl font-black leading-tight xl:text-5xl">Your safety, always within reach.</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/85">
            Sign in to access SOS alerts, live location sharing, emergency contacts, and incident reporting.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
              {[
                "Instant SOS assistance",
                "Private incident reporting",
                "Trusted safety resources",
                "Real-time location support",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/25 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
                  <p className="flex items-start gap-2 text-sm font-medium text-white/95">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white/90" />
                    <span>{item}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 max-w-md rounded-2xl border border-white/20 bg-black/10 p-4 backdrop-blur-sm">
              <p className="text-sm italic text-white/90">
                “A calm, trusted dashboard when seconds matter most.”
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">Samrakshya Design Team</p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center justify-center overflow-hidden rounded-[2rem] border border-rose-300/40 p-4 lg:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(216,27,96,0.16),transparent_45%),radial-gradient(circle_at_88%_78%,rgba(124,58,237,0.12),transparent_42%)]" />
          <div className="pointer-events-none absolute -left-24 -top-10 hidden h-[120%] w-[58%] opacity-20 lg:block">
            <WomanSilhouette />
          </div>
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-rose-300/35 blur-3xl" />
          <div className="relative z-10 w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
