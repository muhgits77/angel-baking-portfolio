const QUOTES = [
  {
    text: "Angel's sourdough ruined every other loaf for me. The crust shatters and the inside is like a cloud. I drive out of my way every Friday.",
    name: "Hannah R.",
    role: "Weekly regular",
  },
  {
    text: "She made our wedding cake and people are still talking about it a year later. The flavor was incredible and it looked like something out of a magazine — but tasted even better.",
    name: "Tyler & Mae",
    role: "Wedding 2024",
  },
  {
    text: "Every single thing I’ve had from her has been perfect. You can taste that she actually cares. My kids beg for the cinnamon knots.",
    name: "Miss Linda",
    role: "Hometown friend",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="text-center">
          <span className="divider-flourish">Kind words</span>
          <h2 className="mt-5 text-balance font-serif text-4xl text-foreground md:text-6xl">
            Love from the table
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <figure
              key={i}
              className="relative rounded-3xl border border-border/60 bg-card p-8 shadow-soft premium-card"
            >
              <span className="absolute -top-4 left-6 font-serif text-[78px] leading-none text-terracotta/20">“</span>
              <blockquote className="mt-2 font-serif text-[15.5px] leading-[1.38] text-foreground/90">
                {q.text}
              </blockquote>
              <figcaption className="mt-6 border-t border-border/60 pt-5">
                <p className="font-medium text-foreground">{q.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{q.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
