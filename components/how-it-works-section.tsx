import { UserPlus, Users, Bell, Shield } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up securely with your email. Your data is protected with industry-standard encryption."
  },
  {
    number: "02",
    icon: Users,
    title: "Add Emergency Contacts",
    description: "Register trusted family members, friends, or authorities who will receive alerts during emergencies."
  },
  {
    number: "03",
    icon: Bell,
    title: "Activate SOS When Needed",
    description: "Press the panic button to instantly send your location and alert message to all your emergency contacts."
  },
  {
    number: "04",
    icon: Shield,
    title: "Access Resources",
    description: "Browse legal information, connect with counselors, and report incidents through our secure platform."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm text-primary font-medium mb-4">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Simple steps to your safety
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Getting started with Samrakshya takes just a few minutes. Here's how you can begin protecting yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-border -translate-x-1/2" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.number.replace("0", "")}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
