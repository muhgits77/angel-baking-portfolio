import aboutImg from "@/assets/about-angel.jpg";

export function AboutSection() {
  return (
    <section id="about" className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:grid-cols-[1.05fr_1.15fr] md:items-center md:gap-16 md:px-8">
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-terracotta/8 blur-3xl" />
          <div className="overflow-hidden rounded-3xl shadow-warm ring-1 ring-border/50">
            <img
              src={aboutImg}
              alt="Angel kneading dough in her sunlit kitchen with flour on the counter"
              loading="lazy"
              className="bake-img aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -right-2 hidden rounded-2xl bg-background px-6 py-4 shadow-warm md:block">
            <p className="font-serif text-2xl text-terracotta">Since age four</p>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Flour on my hands</p>
          </div>
        </div>

        <div className="pt-1 md:pt-5">
          <span className="divider-flourish">My story</span>
          <h2 className="mt-5 text-balance font-serif text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Hi, I’m Angel.
          </h2>

          <div className="mt-6 space-y-5 text-[15.5px] leading-relaxed text-foreground/90 md:text-lg">
            <p>
              I’ve been baking since I was four years old — back when my favorite thing in the world
              was a tiny toy kitchen and a heap of pretend dough. By the time I could reach the counter,
              I was already elbow-deep in real bread, helping fold, knead, and frost.
            </p>
            <p>
              My KitchenAid and wooden boards are practically family now. I believe in using the best
              ingredients I can find, giving good dough the time it deserves, and the quiet patience
              that turns flour, water, and butter into something worth sharing.
            </p>
            <p className="font-serif text-[17px] italic text-terracotta">
              Traditional techniques. A few creative twists. Always made with love — right here in Monticello, Kentucky.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-background px-4 py-1.5 text-foreground/80">Real butter</div>
            <div className="rounded-full bg-background px-4 py-1.5 text-foreground/80">No shortcuts</div>
            <div className="rounded-full bg-background px-4 py-1.5 text-foreground/80">Small batches</div>
          </div>
        </div>
      </div>
    </section>
  );
}
