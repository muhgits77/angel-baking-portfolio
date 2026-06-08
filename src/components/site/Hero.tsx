import heroImg from "@/assets/hero-heroic.jpg";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0a0806]">
      {/* Hero background photo — stunning, high-resolution fresh bakes: steaming sourdough, glazed donuts, layered cakes, golden pastries on warm linen with soft natural light */}
      <img
        src={heroImg}
        alt="Steaming crusty sourdough, glossy glazed donuts, elegant layered cakes and golden flaky pastries artfully arranged on soft warm linen in gentle natural bakery light — irresistible artisan bakes"
        width={1920}
        height={1080}
        className="hero-img absolute inset-0 -z-30 h-full w-full object-cover"
        style={{ objectPosition: "50% 42%" }}
        fetchPriority="high"
        decoding="async"
      />

      {/* Layer 1: Deep cinematic warmth — anchors the appetite */}
      <div className="hero-overlay absolute inset-0 -z-20" aria-hidden />

      {/* Layer 2: Elegant focused vignette — draws eye to the goods */}
      <div className="hero-vignette absolute inset-0 -z-10" aria-hidden />

      {/* Layer 3: Delicate oven-baked glow — makes every crust and glaze sing */}
      <div className="hero-oven-glow absolute inset-0 -z-10" aria-hidden />

      {/* Ultra-soft top veil for crystal-clear fixed nav legibility */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/45 via-black/20 to-transparent -z-10" aria-hidden />

      {/* Fine premium film grain for luxurious tactile depth (very subtle) */}
      <div className="hero-grain absolute inset-0 -z-5 opacity-[0.032] mix-blend-soft-light" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-14 pt-36 md:px-8 md:pb-24 md:pt-40 lg:pb-28">
        <div className="max-w-4xl">
          {/* Refined location + craft badge — elegant entry */}
          <div className="hero-badge inline-flex items-center gap-3 rounded-full border border-cream/25 bg-cream/5 px-4 py-1.5 backdrop-blur-md">
            <span className="h-px w-8 bg-cream/50" />
            <span className="text-[10px] uppercase tracking-[0.36em] text-cream/85">Monticello, Kentucky</span>
          </div>

          {/* Breathtaking, appetite-inducing headline — refined hierarchy */}
          <h1 className="hero-headline mt-6 text-balance font-serif text-[52px] leading-[0.90] tracking-[-0.024em] text-cream drop-shadow-[0_3px_28px_rgb(0,0,0,0.55)] sm:text-[60px] md:mt-7 md:text-[82px] lg:text-[96px]">
            Angel
            <span className="mx-1.5 align-baseline text-[38px] font-normal text-butter/90 sm:text-[48px] md:text-[64px] lg:text-[72px]">·</span>
            <span className="italic">Artisan Baker</span>
          </h1>

          {/* Poetic, mouth-watering subhead — tighter, more evocative */}
          <p className="hero-subhead mt-5 max-w-[38ch] text-balance text-[16.5px] leading-[1.48] tracking-[-0.007em] text-cream/95 sm:text-[17.5px] md:mt-6 md:text-[19.5px] md:leading-[1.44]">
            Slow-rise sourdough. Buttery brioche. Hand-laminated pastries.<br className="hidden sm:block" />
            Every batch made with patience, butter, and love.
          </p>

          {/* Premium CTAs — warm, irresistibly clear, delicious micro-interactions */}
          <div className="mt-8 flex flex-wrap items-center gap-3.5 md:mt-9">
            <a
              href="#gallery"
              className="group inline-flex items-center gap-3 rounded-full bg-cream px-9 py-[17px] text-sm font-medium uppercase tracking-[0.2em] text-cocoa shadow-warm transition-all duration-200 hover:-translate-y-px hover:shadow-lift active:scale-[0.985] active:bg-butter active:shadow-warm"
            >
              See the bakes
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 rounded-full border border-cream/50 bg-cream/7 px-8 py-[17px] text-sm font-medium uppercase tracking-[0.2em] text-cream backdrop-blur-lg transition-all duration-200 hover:border-cream/75 hover:bg-cream/14 hover:-translate-y-px active:bg-cream/20"
            >
              Order something special
            </a>
          </div>

          <p className="hero-eyebrow mt-5 text-[11px] uppercase tracking-[0.34em] text-cream/50">Small batches • Real ingredients • Baked daily</p>
        </div>
      </div>

      {/* Elegant scroll invitation — refined and buttery */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-cream/55 md:flex">
        <span className="text-[10px] font-medium uppercase tracking-[0.36em]">Scroll to explore</span>
        <div className="scroll-cue h-px w-px rounded-full bg-cream/65">
          <div className="h-9 w-px origin-top bg-gradient-to-b from-cream/70 to-transparent" />
        </div>
      </div>
    </section>
  );
}
