import { createFileRoute } from "@tanstack/react-router";
import { NavBar } from "@/components/site/NavBar";
import { Hero } from "@/components/site/Hero";
import { AboutSection } from "@/components/site/AboutSection";
import { SignatureSection } from "@/components/site/SignatureSection";
import { GallerySection } from "@/components/site/GallerySection";
import { TestimonialsSection } from "@/components/site/TestimonialsSection";
import { ContactSection } from "@/components/site/ContactSection";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Angel • Artisan Baker — Monticello, Kentucky" },
      { name: "description", content: "Small-batch artisan breads, cakes, donuts, bagels and pastries baked with love by Angel in Monticello, Kentucky. Custom orders welcome." },
      { property: "og:title", content: "Angel • Artisan Baker" },
      { property: "og:description", content: "Slow-rise breads, layered cakes, pillowy donuts and hand-shaped bagels — baked with love in Monticello, KY." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main className="bg-background text-foreground">
      <NavBar />
      <Hero />
      <AboutSection />
      <SignatureSection />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
