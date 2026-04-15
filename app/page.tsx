"use client";

import { useEffect } from "react";
import axios from "axios";

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function LandingPage() {

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    axios.get("http://localhost:4321/api/auth/me", {
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
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}