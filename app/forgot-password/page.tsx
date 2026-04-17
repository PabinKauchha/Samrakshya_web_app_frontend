"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-200 via-pink-100 to-pink-200 px-4 py-10 sm:px-6">
      <div className="mx-auto mb-8 flex w-fit items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.62_0.1_340)] shadow-md">
          <HeartHandshake className="h-5 w-5 text-white" />
        </div>
        <Link href="/" className="text-xl font-bold text-foreground">
          Samrakshya
        </Link>
      </div>
      <div className="mx-auto flex max-w-3xl justify-center">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

