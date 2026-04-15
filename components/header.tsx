"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, LogOut, Video } from "lucide-react";

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);

useEffect(() => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (token && email) {
    setLoggedInEmail(email);
  } else {
    setLoggedInEmail(null);
  }
}, []);

  function handleSignOut() {
    localStorage.removeItem("samrakshya_email")
    setLoggedInEmail(null)
    setIsMenuOpen(false)
    router.push("/")
  }

  const navLinks = (
    <>
      <Link href="#features"     className="text-sm text-white/80 hover:text-white transition-colors">Features</Link>
      <Link href="#how-it-works" className="text-sm text-white/80 hover:text-white transition-colors">How It Works</Link>
      <Link href="#testimonials" className="text-sm text-white/80 hover:text-white transition-colors">Testimonials</Link>
      <Link href="#contact"      className="text-sm text-white/80 hover:text-white transition-colors">Contact</Link>
    </>
  )

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">Samrakshya</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loggedInEmail ? (
              <>
                <span className="text-xs text-white/60 max-w-[140px] truncate">{loggedInEmail}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20 gap-1.5"
                  asChild
                >
                  <Link href="/report">
                    <Video className="w-4 h-4" />
                    Report
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/20 gap-1.5"
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30 gap-1.5"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              {navLinks}
              <div className="flex flex-col gap-2 pt-4">
                {loggedInEmail ? (
                  <>
                    <p className="text-xs text-white/50 truncate px-1">{loggedInEmail}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20 gap-1.5 justify-start"
                      asChild
                    >
                      <Link href="/report" onClick={() => setIsMenuOpen(false)}>
                        <Video className="w-4 h-4" />
                        Report Incident
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20 gap-1.5 justify-start"
                      asChild
                    >
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white/20 text-white hover:bg-white/30 gap-1.5 justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white hover:bg-white/20"
                      asChild
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white text-primary hover:bg-white/90 font-semibold"
                      asChild
                    >
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
