"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield, Eye, EyeOff, ArrowRight, Heart, Lock, Users, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await loginUser(email, password);

    // STEP 1: store token
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.user.email)
    // STEP 2: get role
    const role = res.data.user.role;

    console.log("ROLE:", role);
    console.log("TOKEN:", res.data.token);

    toast.success("Welcome back!");

    // ✅ STEP 3: delay + hard redirect (IMPORTANT)
    setTimeout(() => {
      if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    }, 100);

  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : "Login failed.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand + decorative ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Butterfly SVG decorations */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 600"
          className="absolute inset-0 w-full h-full opacity-10"
          fill="white"
        >
          {/* Butterfly 1 */}
          <g transform="translate(320,80)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" />
            <path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" />
            <path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
            <ellipse cx="0" cy="8" rx="2.5" ry="10" />
          </g>
          {/* Butterfly 2 */}
          <g transform="translate(80,200) scale(0.75) rotate(-15)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" />
            <path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" />
            <path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
            <ellipse cx="0" cy="8" rx="2.5" ry="10" />
          </g>
          {/* Butterfly 3 */}
          <g transform="translate(250,380) scale(0.6) rotate(10)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" />
            <path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" />
            <path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
            <ellipse cx="0" cy="8" rx="2.5" ry="10" />
          </g>
          {/* Butterfly 4 */}
          <g transform="translate(150,500) scale(0.8) rotate(-8)">
            <path d="M0,0 C-18,-23 -48,-28 -48,-7 C-48,10 -18,15 0,0" />
            <path d="M0,0 C18,-23 48,-28 48,-7 C48,10 18,15 0,0" />
            <path d="M0,0 C-15,8 -30,26 -20,38 C-12,46 5,32 0,0" />
            <path d="M0,0 C15,8 30,26 20,38 C12,46 -5,32 0,0" />
            <ellipse cx="0" cy="8" rx="2.5" ry="10" />
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

        {/* Centre quote */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-white leading-snug">
            Your safety is<br />our promise.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed max-w-sm">
            Join thousands of women who feel safer, more informed, and more empowered every day.
          </p>

          {/* Trust stats */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Users, label: "10,000+", sub: "Women protected" },
              { icon: Shield, label: "24/7", sub: "Always available" },
              { icon: Heart, label: "100%", sub: "Free to use" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-white/70 mb-2" />
                <p className="text-white font-bold text-lg leading-none">{label}</p>
                <p className="text-white/60 text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer credit */}
        <p className="relative z-10 text-white/40 text-sm">
          © 2026 Samrakshya · Kathford International College
        </p>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-background">

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

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pr-10"
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

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>

          {/* Security note */}
          <div className="mt-8 flex items-center gap-2 p-4 rounded-xl bg-secondary border border-border">
            <Lock className="w-4 h-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your data is encrypted with SHA-256 and never shared with third parties.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
