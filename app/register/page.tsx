"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HeartHandshake, Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react"
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

      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, oklch(0.55 0.20 350) 0%, oklch(0.44 0.22 320) 100%)" }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Samrakshya</span>
          </Link>
        </div>

        {/* Perks */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Everything you need<br />to stay safe.
            </h2>
            <p className="text-white/70 leading-relaxed">
              Create your free account and get instant access to all safety features.
            </p>
          </div>

          <ul className="space-y-3">
            {perks.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/85 text-sm">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-white/35 text-sm">
          © 2026 Samrakshya · Kathford International College
        </p>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary shadow-md">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Samrakshya</span>
          </Link>
        </div>

        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">Create your account</h1>
            <p className="text-muted-foreground">Free forever. No credit card required.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold">Full name</Label>
              <Input id="fullName" type="text" placeholder="Sunita Sharma" value={form.fullName}
                onChange={set("fullName")} className="h-12 rounded-xl bg-secondary/40 border-border/70 focus:bg-background transition-colors" required />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                onChange={set("email")} className="h-12 rounded-xl bg-secondary/40 border-border/70 focus:bg-background transition-colors" required />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone number <span className="ml-1 text-muted-foreground font-normal text-xs">(for SOS alerts)</span>
              </Label>
              <Input id="phone" type="tel" placeholder="+977 98XXXXXXXX" value={form.phone}
                onChange={set("phone")} className="h-12 rounded-xl bg-secondary/40 border-border/70 focus:bg-background transition-colors" required />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                  value={form.password} onChange={set("password")}
                  className="h-12 rounded-xl pr-11 bg-secondary/40 border-border/70 focus:bg-background transition-colors"
                  minLength={8} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-semibold">Confirm password</Label>
              <div className="relative">
                <Input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat your password"
                  value={form.confirm} onChange={set("confirm")}
                  className={`h-12 rounded-xl pr-11 bg-secondary/40 border-border/70 focus:bg-background transition-colors ${!passwordsMatch ? "border-destructive" : ""}`}
                  required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle confirm password">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!passwordsMatch && <p className="text-xs text-destructive font-medium">Passwords do not match.</p>}
            </div>

            {/* Terms */}
            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our{" "}
              <Link href="#" className="text-primary hover:underline font-medium">Terms of Service</Link>{" "}and{" "}
              <Link href="#" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <Button type="submit" size="lg"
              className="w-full gap-2 h-12 rounded-xl font-bold text-base bg-gradient-to-r from-primary to-[oklch(0.48_0.22_330)] hover:opacity-90 transition-opacity shadow-lg shadow-primary/25"
              disabled={!passwordsMatch || loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : <>Create Free Account <ArrowRight className="w-4 h-4" /></>}
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

          <Button variant="outline" size="lg" className="w-full h-12 rounded-xl font-semibold" asChild>
            <Link href="/login">Sign In Instead</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
