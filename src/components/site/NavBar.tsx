import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#signature", label: "Signature" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#testimonials", label: "Kind Words" },
  { href: "/#contact", label: "Contact" },
];

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const admin = useAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleStudioClick = () => {
    setOpen(false);
    if (admin.isAdmin) {
      // already unlocked — scroll to gallery so they see the controls
      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      admin.openPrompt();
    }
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/92 backdrop-blur-xl border-b border-border/50 shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8 md:py-4">
        <Link to="/" className="group flex items-baseline gap-2">
          <span
            className={cn(
              "font-serif text-[27px] tracking-[-0.015em] transition-colors",
              scrolled ? "text-foreground" : "text-cream drop-shadow"
            )}
          >
            Angel
          </span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.28em] transition-colors",
              scrolled ? "text-terracotta" : "text-cream/80 drop-shadow"
            )}
          >
            Artisan Baker
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors",
                scrolled ? "text-foreground/75 hover:text-terracotta" : "text-cream/90 hover:text-cream drop-shadow"
              )}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={handleStudioClick}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wider transition",
              scrolled
                ? "border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-cream"
                : "border-cream/40 text-cream/90 hover:bg-cream/10"
            )}
          >
            <Star size={13} /> Studio
          </button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={handleStudioClick}
            className={cn(
              "mr-1 rounded-full border px-3 py-1 text-xs font-medium tracking-wider",
              scrolled ? "border-terracotta/50 text-terracotta" : "border-cream/40 text-cream/90"
            )}
          >
            Studio
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className={cn("rounded-full p-2", scrolled ? "text-foreground" : "text-cream")}
          >
            {open ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md">
          <div className="flex flex-col px-6 py-3 text-base">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-foreground/80 active:text-terracotta"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={handleStudioClick}
              className="mt-2 flex items-center gap-2 rounded-full border border-terracotta/30 py-3 pl-4 pr-5 text-left text-sm font-medium text-terracotta active:bg-terracotta/5"
            >
              <Star size={16} /> Open Studio
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
