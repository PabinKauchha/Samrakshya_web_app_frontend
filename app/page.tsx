"use client";

import { useEffect } from "react";
import axios from "axios";

import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { HeroSectionAdmin } from "@/components/hero-section-admin";
import { FeaturesSection } from "@/components/features-section";
import { FeaturesSectionAdmin } from "@/components/features-section-admin";
import { RecentAlertsSection } from "@/components/recent-alerts-section";
import { LiveOpsStrip } from "@/components/live-ops-strip";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth/auth-provider";

export default function LandingPage() {
  const { isAdmin } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:4321/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {isAdmin ? (
          <>
            <HeroSectionAdmin />
            <LiveOpsStrip />
            <RecentAlertsSection />
            <FeaturesSectionAdmin />
          </>
        ) : (
          <>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <StatsSection />
            <TestimonialsSection />
            <CTASection />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
