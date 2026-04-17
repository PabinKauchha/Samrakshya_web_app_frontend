"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

function getPasswordStrength(password: string) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  if (password.length >= 10 && hasUpper && hasLower && hasNumber && hasSymbol) return "Strong";
  if (password.length >= 8 && hasUpper && hasLower && hasNumber) return "Medium";
  return "Weak";
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const canSubmit = useMemo(() => Boolean(password && confirmPassword && token && !loading), [password, confirmPassword, token, loading]);

  const validate = () => {
    const nextErrors: FieldErrors = {};
    if (!password) nextErrors.password = "New password is required.";
    else if (password.length < 8) nextErrors.password = "Password must be at least 8 characters.";
    if (!confirmPassword) nextErrors.confirmPassword = "Please confirm your new password.";
    else if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setCompleted(true);
      toast.success("Password reset successful.");
      setTimeout(() => router.replace("/login"), 1200);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-[2rem] border border-primary/25 bg-pink-100/90 p-6 shadow-xl shadow-primary/10 backdrop-blur-sm sm:p-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Reset Password</h1>
        <p className="mt-2 text-sm text-foreground/65">Create a new secure password for your account.</p>
      </div>

      {!token ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Invalid or missing reset token.
          </div>
          <Button asChild className="h-11 w-full rounded-xl bg-primary text-primary-foreground">
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      ) : completed ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password updated successfully. Redirecting to login...
          </div>
          <Button asChild className="h-11 w-full rounded-xl bg-primary text-primary-foreground">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className="h-12 rounded-xl border-primary/20 bg-white pr-11 focus-visible:ring-primary/40"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <p
                className={`text-xs ${
                  strength === "Strong"
                    ? "text-emerald-600"
                    : strength === "Medium"
                    ? "text-amber-600"
                    : "text-destructive"
                }`}
              >
                Strength: {strength}
              </p>
            )}
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className="h-12 rounded-xl border-primary/20 bg-white pr-11 focus-visible:ring-primary/40"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full gap-2 rounded-xl bg-gradient-to-r from-primary to-[oklch(0.62_0.1_340)] font-bold text-primary-foreground hover:opacity-90"
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-foreground/65">
            Back to{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

