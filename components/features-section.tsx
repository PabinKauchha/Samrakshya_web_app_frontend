import { 
  AlertTriangle, 
  Scale, 
  Heart, 
  Users, 
  Lock, 
  FileText,
  Plus
} from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "Emergency SOS",
    description: "Instantly alert your emergency contacts with your real-time location via SMS. Works even in low connectivity areas."
  },
  {
    icon: Scale,
    title: "Legal Guidance",
    description: "Access comprehensive information about your rights regarding sexual harassment, workplace safety, and legal procedures."
  },
  {
    icon: Heart,
    title: "Mental Health Support",
    description: "Connect with professional counselors and access mental health resources to help process traumatic experiences."
  },
  {
    icon: Users,
    title: "Emergency Contacts",
    description: "Easily manage and update your list of trusted contacts who will receive alerts during emergencies."
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Your data is encrypted and secure. We use SHA-256 password hashing and secure authentication protocols."
  },
  {
    icon: FileText,
    title: "Incident Reporting",
    description: "Document and report incidents with evidence. Admins review and provide appropriate guidance and support."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm text-primary font-medium mb-4">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Everything you need to stay safe
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Samrakshya combines emergency response, legal awareness, and emotional support into one comprehensive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              
              <div className="aspect-video rounded-lg bg-secondary mb-6 flex items-center justify-center">
                <feature.icon className="w-12 h-12 text-primary/60" />
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
