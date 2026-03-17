"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/lib/api"

const perks = [
  "Instant SOS alerts to your emergency contacts",
  "Real-time GPS location sharing",
  "Legal rights & harassment guidance",
  "24/7 mental health support access",
  "Secure incident reporting",
  "100% free, always",
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const passwordsMatch = form.confirm === "" || form.password === form.confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordsMatch) return
    setLoading(true)
    try {
      await registerUser(form.fullName, form.email, form.password)
      localStorage.setItem("samrakshya_email", form.email)
      toast.success("Account created! Welcome to Samrakshya.")
      router.push("/dashboard")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-primary flex-col justify-between p-12 relative overflow-hidden">

        {/* Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Butterfly decorations */}
        <svg aria-hidden="true" viewBox="0 0 400 700" className="absolute inset-0 w-full h-full opacity-10" fill="white">
          <g transform="translate(340,100)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" /><path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" /><path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
          </g>
          <g transform="translate(60,280) scale(0.7) rotate(-18)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" /><path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" /><path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
          </g>
          <g transform="translate(280,480) scale(0.55) rotate(12)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" /><path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" /><path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
          </g>
          <g transform="translate(120,580) scale(0.65) rotate(-6)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" /><path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" /><path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
          </g>
        </svg>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Samrakshya</span>
          </Link>
        </div>

        {/* Perks list */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-snug mb-3">
              Everything you need<br />to stay safe.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Create your free account and get instant access to all safety features.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-white/20 shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/85 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/40 text-sm">
          © 2026 Samrakshya · Kathford International College
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Samrakshya</span>
          </Link>
        </div>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Sunita Sharma"
                value={form.fullName}
                onChange={set("fullName")}
                className="h-11"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                className="h-11"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone number
                <span className="ml-1 text-muted-foreground font-normal text-xs">(for SOS alerts)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={form.phone}
                onChange={set("phone")}
                className="h-11"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  className="h-11 pr-10"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={set("confirm")}
                  className={`h-11 pr-10 ${!passwordsMatch ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground pt-1">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={!passwordsMatch || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">already have an account?</span>
            </div>
          </div>

          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link href="/login">Sign In Instead</Link>
          </Button>
        </div>
      </div>

    </div>
  )
}
