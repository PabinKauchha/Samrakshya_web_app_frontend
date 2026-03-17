"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Samrakshya</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#testimonials"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="text-sm text-white/80 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/20"
              asChild
            >
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              asChild
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#testimonials"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Testimonials
              </Link>
              <Link
                href="#contact"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white hover:bg-white/20"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90 font-semibold"
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
