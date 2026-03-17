"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight, MapPin, Bell, Phone } from "lucide-react"
import { WomanSilhouette } from "@/components/woman-silhouette"

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32" style={{ minHeight: "100svh" }}>
      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
      </div>

      {/* Silhouette — lives outside overflow-hidden so butterflies never get double-clipped */}
      <WomanSilhouette />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Your Safety, Our Priority</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
            Safety at every step
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            Samrakshya empowers women with instant emergency alerts, legal guidance on harassment, 
            and mental health support — all in one secure platform designed for your safety.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">SOS Alerts</h3>
              <p className="text-sm text-muted-foreground">One-tap emergency alerts to your trusted contacts</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Live Location</h3>
              <p className="text-sm text-muted-foreground">Real-time GPS tracking shared with contacts</p>
            </div>

            <div className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Access to helplines and counseling services</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
