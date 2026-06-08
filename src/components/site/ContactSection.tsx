import { useState } from "react";
import { Instagram, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Please share your name").max(80),
  email: z.string().trim().email("That email looks off").max(160),
  occasion: z.string().trim().max(80).optional(),
  message: z.string().trim().min(5, "Tell me a bit more").max(2000),
});

export function ContactSection() {
  const [sending, setSending] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      occasion: fd.get("occasion"),
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSending(true);
    const { name, email, occasion, message } = parsed.data;
    const subject = encodeURIComponent(`New inquiry from ${name}${occasion ? ` — ${occasion}` : ""}`);
    const body = encodeURIComponent(
      `From: ${name} <${email}>\nOccasion: ${occasion ?? "—"}\n\n${message}`
    );
    window.location.href = `mailto:hello@angelbakes.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      toast.success("Your email is ready to send. Talk soon!");
      setSending(false);
      e.currentTarget?.reset?.();
    }, 420);
  };

  return (
    <section id="contact" className="bg-gradient-warm py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:grid md:grid-cols-[1fr_1.15fr] md:gap-16 md:px-8">
        <div>
          <span className="divider-flourish">Get in touch</span>
          <h2 className="mt-5 text-balance font-serif text-4xl text-foreground md:text-6xl">
            Let’s bake<br />something together
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground/80">
            Custom orders, weddings, birthdays, holiday boxes, collabs — I’d love to hear what you’re dreaming up.
          </p>

          <div className="mt-9 space-y-4 text-[15px]">
            <a href="mailto:hello@angelbakes.com" className="flex items-center gap-4 rounded-xl py-1 active:text-terracotta">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-background shadow-soft">
                <Mail size={18} className="text-terracotta" />
              </span>
              <span>hello@angelbakes.com</span>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-xl py-1 active:text-terracotta"
            >
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-background shadow-soft">
                <Instagram size={18} className="text-terracotta" />
              </span>
              <span>@angel.bakes</span>
            </a>
            <div className="flex items-center gap-4 rounded-xl py-1">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-background shadow-soft">
                <MapPin size={18} className="text-terracotta" />
              </span>
              <span>Monticello, Kentucky</span>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-10 rounded-3xl border border-border/60 bg-background/95 p-6 shadow-warm backdrop-blur md:mt-0 md:p-9"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field name="name" label="Your name" placeholder="Hannah" />
            <Field name="email" label="Email" type="email" placeholder="you@example.com" />
          </div>
          <div className="mt-5">
            <Field name="occasion" label="Occasion (optional)" placeholder="Wedding, birthday, holiday box…" />
          </div>
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tell me more
            </label>
            <textarea
              name="message"
              rows={5}
              required
              maxLength={2000}
              placeholder="Date, number of guests, flavors you love, anything that matters…"
              className="textarea-premium w-full rounded-2xl border border-border bg-background/70 px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="mt-6 w-full rounded-full bg-terracotta py-4 text-sm font-medium uppercase tracking-[0.18em] text-cream shadow-warm transition active:opacity-90 disabled:opacity-60 md:w-auto md:px-12"
          >
            {sending ? "Opening your email…" : "Send inquiry"}
          </button>
          <p className="mt-4 text-center text-xs text-muted-foreground md:text-left">
            I usually reply within a day or two.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  name, label, type = "text", placeholder,
}: { name: string; label: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        maxLength={160}
        className="input-premium w-full rounded-2xl border border-border bg-background/70 px-4 py-3.5 text-[15px] placeholder:text-muted-foreground/60 focus:outline-none"
      />
    </div>
  );
}
