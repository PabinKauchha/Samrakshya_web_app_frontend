const stats = [
  {
    value: "23%",
    label: "of women aged 15-49 have faced physical violence in Nepal",
    source: "NDHS 2022"
  },
  {
    value: "66%",
    label: "of victims never sought help after experiencing violence",
    source: "UNFPA Nepal"
  },
  {
    value: "14,093",
    label: "cases of gender-based violence recorded by helpline 1145",
    source: "National Women Commission"
  },
  {
    value: "48%",
    label: "of Nepali women have experienced some form of violence",
    source: "UNFPA Report"
  }
]

export function StatsSection() {
  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm text-primary font-medium mb-4">The Reality</p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Why Samrakshya matters
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            These statistics highlight the urgent need for accessible safety resources and support systems for women in Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-8 rounded-2xl bg-card border border-border text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-4">
                {stat.value}
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {stat.label}
              </p>
              <span className="text-xs text-muted-foreground/60">
                Source: {stat.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
