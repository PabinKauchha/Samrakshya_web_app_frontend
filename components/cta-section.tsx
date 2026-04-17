"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake, LayoutDashboard, Video, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="bg-gradient-to-b from-pink-100 via-pink-50 to-pink-100 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-pink-200 via-pink-100 to-pink-50 px-8 py-12 text-center shadow-2xl shadow-primary/15 md:px-16 md:py-16">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-fuchsia-500/20 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 border border-primary/20">
              <HeartHandshake className="w-8 h-8 text-primary" />
            </div>

            {isAuthenticated ? (
              <>
                <h2 className="mb-6 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                  Your safety tools are ready
                </h2>

                <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70 text-pretty">
                  Head to your dashboard to manage SOS alerts, emergency contacts, and live location
                  sharing — or quickly file a new incident report.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 sm:w-auto"
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full gap-2 rounded-2xl border-primary/25 bg-pink-50 text-foreground hover:bg-pink-100 sm:w-auto"
                    asChild
                  >
                    <Link href="/report">
                      <Video className="w-4 h-4" />
                      Report Incident
                    </Link>
                  </Button>
                </div>

                <p className="mt-8 text-sm text-foreground/60">
                  Need help? Reach our team anytime via the contact page.
                </p>

                <div className="mt-6 flex justify-center">
                  <Link
                    href="/problems"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-4 py-2 text-[12.5px] font-semibold text-[#AD1457] shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Share a problem with admin
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="mb-6 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                  Your safety journey starts here
                </h2>

                <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/70 text-pretty">
                  Join thousands of women who have taken control of their safety. Create your free
                  account today and access emergency alerts, legal guidance, and support resources.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="h-12 w-full gap-2 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 sm:w-auto"
                    asChild
                  >
                    <Link href="/register">
                      Create Free Account
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 w-full rounded-2xl border-primary/25 bg-pink-50 text-foreground hover:bg-pink-100 sm:w-auto"
                    asChild
                  >
                    <Link href="#contact">Contact Us</Link>
                  </Button>
                </div>

                <p className="mt-8 text-sm text-foreground/60">
                  Free forever for personal use. No credit card required.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
