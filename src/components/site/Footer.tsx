import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3 md:items-end">
          <div>
            <p className="font-serif text-3xl text-foreground">Angel</p>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-terracotta">Artisan Baker</p>
            <p className="mt-4 max-w-xs text-sm leading-snug text-muted-foreground">
              Small-batch breads, cakes, and pastries baked with love in Monticello, Kentucky.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 text-[14.5px] md:items-center">
            <a href="#contact" className="text-foreground/80 hover:text-terracotta active:text-terracotta">Custom orders</a>
            <a href="#gallery" className="text-foreground/80 hover:text-terracotta active:text-terracotta">Full gallery</a>
            <a href="#signature" className="text-foreground/80 hover:text-terracotta active:text-terracotta">Signature bakes</a>
          </div>

          <div className="flex gap-3 md:justify-end">
            <a
              href="mailto:hello@angelbakes.com"
              aria-label="Email"
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-foreground/70 transition hover:bg-terracotta hover:text-cream active:bg-terracotta/90"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-foreground/70 transition hover:bg-terracotta hover:text-cream active:bg-terracotta/90"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Angel · Baked with love in Monticello, KY
          <span className="mx-2 text-muted-foreground/40">·</span>
          <a href="#gallery" onClick={(e) => { /* studio access is via the floating button or /admin when route is enabled */ }} className="hover:text-foreground/70">Studio</a>
        </div>
      </div>
    </footer>
  );
}
