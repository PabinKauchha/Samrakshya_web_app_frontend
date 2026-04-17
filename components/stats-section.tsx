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
    <section className="bg-gradient-to-b from-pink-50 via-pink-100 to-pink-50 py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-primary">The Reality</p>
          <h2 className="mb-6 text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Why Samrakshya matters
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            These statistics highlight the urgent need for accessible safety resources and support systems for women in Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.75rem] border border-primary/20 bg-pink-50/90 p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 text-4xl font-black text-primary md:text-5xl">
                {stat.value}
              </div>
              <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                {stat.label}
              </p>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground/60">
                Source: {stat.source}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
