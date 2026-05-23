"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, HeartHandshake, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const { setAuthSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const canSubmit = useMemo(() => Boolean(email && password && !loading), [email, password, loading]);

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Email is required.";
    else if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // UI-only OAuth redirect entry point.
    window.location.href = "http://localhost:4321/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginUser(email.trim(), password);
      const userRole = res.data.user.role === "admin" ? "admin" : "user";
      setAuthSession(res.data.token, res.data.user.email, userRole);
      toast.success("Welcome back!");
      if (userRole === "admin") router.replace("/admin");
      else router.replace("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl border border-rose-200/60 p-6 shadow-[0_30px_60px_-20px_rgba(173,20,87,0.28)] backdrop-blur-xl transition-all duration-500 motion-safe:animate-in motion-safe:fade-in sm:p-8"
      style={{
        background:
          "linear-gradient(155deg, rgba(255,241,246,0.95) 0%, rgba(255,228,239,0.92) 55%, rgba(253,214,229,0.88) 100%)",
      }}
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#AD1457]">
        <BadgeCheck className="h-3.5 w-3.5" />
        Secure login
      </div>
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D81B60] to-[#AD1457] text-white shadow-lg shadow-[#AD1457]/30">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to continue to your protected safety workspace</p>
        <p className="mt-1 text-xs font-medium text-gray-500">Your data is protected</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-700">
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="you@example.com"
              className="h-12 rounded-xl border-rose-200/70 bg-white/80 px-10 text-gray-900 placeholder:text-gray-400 shadow-[0_1px_0_rgba(17,24,39,0.03)] transition-all duration-200 focus-visible:border-[#D81B60] focus-visible:ring-2 focus-visible:ring-[#D81B60]/30 focus-visible:bg-white"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-700">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-rose-700 transition-colors hover:text-rose-800 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="Enter your password"
              className="h-12 rounded-xl border-rose-200/70 bg-white/80 px-10 pr-11 text-gray-900 placeholder:text-gray-400 shadow-[0_1px_0_rgba(17,24,39,0.03)] transition-all duration-200 focus-visible:border-[#D81B60] focus-visible:ring-2 focus-visible:ring-[#D81B60]/30 focus-visible:bg-white"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-800"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-[#D81B60] via-[#C2185B] to-[#AD1457] font-semibold text-white shadow-lg shadow-[#AD1457]/30 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#AD1457]/40 active:scale-[0.99]"
          disabled={!canSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Login
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-rose-200/70" />
        <span className="rounded-full border border-rose-200/80 bg-rose-50/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#AD1457]">
          OR
        </span>
        <div className="h-px flex-1 bg-rose-200/70" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={handleGoogleLogin}
        className="h-12 w-full rounded-xl border-rose-200/80 bg-white/85 text-gray-800 shadow-sm transition-all duration-200 hover:bg-rose-50/80 hover:shadow-md"
        disabled={googleLoading}
      >
        {googleLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Redirecting...
          </>
        ) : (
          <>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" className="mr-2">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.8-2.7-5.8-5.9s2.6-5.9 5.8-5.9c1.8 0 3 .8 3.7 1.5l2.5-2.5C16.6 3.4 14.6 2.5 12 2.5 6.9 2.5 2.8 6.6 2.8 11.8S6.9 21 12 21c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z" />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <p className="mt-6 text-center text-sm text-gray-600">
        New here?{" "}
        <Link href="/register" className="font-semibold text-rose-700 transition-colors hover:text-rose-800 hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-4 text-center text-[11px] text-gray-500">
        By continuing, you agree to Samrakshya security and privacy standards.
      </p>
    </div>
  );
}

