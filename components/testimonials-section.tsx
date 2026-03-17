import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sunita K.",
    role: "Working Professional",
    avatar: "SK",
    stars: 5,
    content:
      "The SOS feature gave me peace of mind during late-night commutes. Knowing my family can reach me instantly makes all the difference.",
  },
  {
    name: "Priya M.",
    role: "College Student",
    avatar: "PM",
    stars: 4,
    content:
      "The legal guidance section helped me understand my rights at the workplace. I wish I had this resource earlier.",
  },
  {
    name: "Anita R.",
    role: "Entrepreneur",
    avatar: "AR",
    stars: 5,
    content:
      "Samrakshya's counseling resources connected me with support I didn't know existed. It's more than just an emergency app.",
  },
  {
    name: "Meera S.",
    role: "Teacher",
    avatar: "MS",
    stars: 4,
    content:
      "I recommended this app to all my female students. The incident reporting feature is so important for building a safer community.",
  },
  {
    name: "Kavya T.",
    role: "Healthcare Worker",
    avatar: "KT",
    stars: 5,
    content:
      "Working night shifts used to feel scary. With Samrakshya, my location is always shared with my husband. I feel truly protected.",
  },
  {
    name: "Riya B.",
    role: "Graduate Student",
    avatar: "RB",
    stars: 4,
    content:
      "The privacy-first approach is what convinced me. My data is safe and I can trust the platform completely.",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm text-primary font-medium mb-4">Testimonials</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Trusted by women across Nepal
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Hear from women who have found safety, support, and empowerment through Samrakshya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col p-8 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < t.stars ? "fill-primary text-primary" : "fill-muted text-muted-foreground/30"}`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed flex-1 mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
