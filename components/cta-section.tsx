import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl bg-card border border-border overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-8">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Your safety journey starts here
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 text-pretty">
              Join thousands of women who have taken control of their safety. 
              Create your free account today and access emergency alerts, legal guidance, and support resources.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                <Link href="/register">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="#contact">Contact Us</Link>
              </Button>
            </div>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Free forever for personal use. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
