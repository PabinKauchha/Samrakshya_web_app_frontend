import { 
  AlertTriangle, 
  Scale, 
  Heart, 
  Users, 
  Lock, 
  FileText,
  Plus,
  ArrowUpRight
} from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Emergency SOS",
    description:
      "Instantly alert your emergency contacts with your real-time location via SMS. Works even in low connectivity areas.",
    badge: "Real-time location sync",
  },
  {
    icon: Scale,
    title: "Legal Guidance",
    description:
      "Access comprehensive information about your rights regarding sexual harassment, workplace safety, and legal procedures.",
    badge: "Verified legal frameworks",
  },
  {
    icon: Heart,
    title: "Mental Health Support",
    description:
      "Connect with professional counselors and access mental health resources to help process traumatic experiences.",
    badge: "24/7 empathetic support",
  },
  {
    icon: Users,
    title: "Emergency Contacts",
    description:
      "Easily manage and update your list of trusted contacts who will receive alerts during emergencies.",
    badge: "Automated alert system",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Your data is encrypted and secure. We use SHA-256 password hashing and secure authentication protocols.",
    badge: "End-to-end encrypted",
  },
  {
    icon: FileText,
    title: "Incident Reporting",
    description:
      "Document and report incidents with evidence. Admins review and provide appropriate guidance and support.",
    badge: "Guided submission process",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-b from-pink-100 via-pink-50 to-pink-100 py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.12),transparent_28%)]" />
      <div className="container mx-auto px-4">
        <div className="relative z-10">
          <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-primary">Features</p>
              <h2 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">
                A polished safety toolkit built for real-life moments.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              Samrakshya combines emergency response, legal awareness, emotional support, and trusted contact tools
              into one professional platform designed for clarity under pressure.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-pink-50/90 p-7 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-primary/15"
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-gradient-to-br from-primary/10 to-fuchsia-500/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-fuchsia-500/15">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-pink-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <Plus className="h-3.5 w-3.5" />
                      0{index + 1}
                    </div>
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                  <p className="mb-6 text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>

                  {/* Bottom-left pill badge with click-affordance arrow */}
                  <div className="flex items-center justify-start">
                    <button
                      type="button"
                      aria-label={`${feature.title}: ${feature.badge}`}
                      className="group/badge inline-flex items-center gap-1.5 rounded-full border border-[#FBDCE5] bg-[#FFF5F7] px-3 py-1.5 text-[12px] font-semibold text-[#D81B60] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D81B60]/40 hover:bg-[#FFEBF1] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D81B60]/35"
                      style={{ fontWeight: 600 }}
                    >
                      <span>{feature.badge}</span>
                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-[#D81B60] transition-transform duration-200 group-hover/badge:-translate-y-0.5 group-hover/badge:translate-x-0.5"
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
