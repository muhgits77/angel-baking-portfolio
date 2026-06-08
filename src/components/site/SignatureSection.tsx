import { useGallery } from "@/hooks/useGallery";
import { cn } from "@/lib/utils";

export function SignatureSection() {
  const { featured } = useGallery();

  return (
    <section id="signature" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-2xl">
          <span className="divider-flourish">Signature Bakes</span>
          <h2 className="mt-5 text-balance font-serif text-4xl text-foreground md:text-6xl">
            A few of my favorites
          </h2>
          <p className="mt-4 text-balance text-muted-foreground">
            These are the recipes I come back to again and again — the ones friends, family
            and customers ask for by name.
          </p>
        </div>

        {featured.length > 0 ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((b) => (
              <article
                key={b.id}
                className="group overflow-hidden rounded-3xl bg-card shadow-soft premium-card"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={b.imageData}
                    alt={b.title}
                    loading="lazy"
                    className="bake-img h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-terracotta">{b.category}</p>
                  <h3 className="mt-1.5 font-serif text-[20px] leading-tight text-foreground">{b.title}</h3>
                  {b.description && (
                    <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-snug text-muted-foreground">{b.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-serif text-xl text-foreground">Signature bakes will appear here</p>
            <p className="mt-2 text-sm text-muted-foreground">
              In the Studio, mark your favorite photos with the star to feature them on the homepage.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
