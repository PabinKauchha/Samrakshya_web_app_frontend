import Link from "next/link"
import { HeartHandshake, Phone, Mail, MapPin } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  resources: [
    { label: "Legal Rights", href: "#" },
    { label: "Safety Tips", href: "#" },
    { label: "Counseling", href: "#" },
    { label: "Helpline Directory", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer id="contact" className="border-t border-primary/20 bg-gradient-to-b from-pink-100 to-pink-50 text-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-fuchsia-500 to-violet-600 shadow-lg shadow-primary/20">
                <HeartHandshake className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Samrakshya</span>
            </Link>
            
            <p className="mb-6 max-w-sm leading-relaxed text-foreground/65">
              Empowering women with safety tools, legal awareness, and mental health support. 
              Your safety is our priority.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-foreground/65">
                <Phone className="w-4 h-4 text-primary" />
                <span>Emergency Helpline: 100</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/65">
                <Mail className="w-4 h-4 text-primary" />
                <span>abhishanb169@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-foreground/65">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Balkumari, Lalitpur, Nepal</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-foreground/65 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-foreground/65 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-foreground/65 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-primary/15 py-8 md:flex-row">
          <p className="text-sm text-foreground/45">
            © 2026 Samrakshya. All rights reserved.
          </p>
          <p className="text-sm text-foreground/45">
            A project by Kathford International College of Engineering and Management
          </p>
        </div>
      </div>
    </footer>
  )
}
