import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGallery } from "@/hooks/useGallery";
import { CATEGORIES, type Category, type GalleryItem } from "@/lib/gallery";
import { toast } from "sonner";
import { ArrowLeft, Star, Trash2, Edit2, ArrowUp, ArrowDown, Upload, LogOut, Plus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio — Angel's Artisan Kitchen" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

const PASSCODE = "angelbakes2026";

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Persist unlock on this device
  useEffect(() => {
    if (localStorage.getItem("angel_admin_unlocked") === "1") setUnlocked(true);
  }, []);

  function tryUnlock(e?: React.FormEvent) {
    e?.preventDefault();
    if (code.trim() === PASSCODE) {
      setUnlocked(true);
      setError("");
      localStorage.setItem("angel_admin_unlocked", "1");
    } else {
      setError("Passcode incorrect. It’s angelbakes2026.");
      setCode("");
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-gradient-warm px-6 py-16">
        <div className="mx-auto max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
            <ArrowLeft size={16} /> Back to the bakery
          </Link>

          <div className="mt-12 rounded-3xl border border-border bg-background p-8 shadow-warm">
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-terracotta/10 text-terracotta">
                <Star size={24} />
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Private studio</p>
              <h1 className="mt-2 font-serif text-3xl">Welcome back, Angel</h1>
              <p className="mt-2 text-sm text-muted-foreground">Enter your passcode to manage the gallery.</p>
            </div>

            <form onSubmit={tryUnlock} className="mt-8 space-y-4">
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Passcode"
                className="w-full rounded-2xl border border-border bg-background px-5 py-4 text-center text-xl tracking-[4px] focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              />
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
              <button
                type="submit"
                disabled={!code}
                className="w-full rounded-full bg-terracotta py-4 text-sm font-medium uppercase tracking-[0.2em] text-cream disabled:opacity-60"
              >
                Enter studio
              </button>
            </form>
            <p className="mt-6 text-center text-xs text-muted-foreground">Photos are stored only in this browser.</p>
          </div>
        </div>
      </div>
    );
  }

  return <StudioDashboard onLock={() => {
    setUnlocked(false);
    localStorage.removeItem("angel_admin_unlocked");
  }} />;
}

function StudioDashboard({ onLock }: { onLock: () => void }) {
  const { items, addPhotos, update, remove, move, reorder } = useGallery();
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const res = await addPhotos(files);
    if (res.ok > 0) toast.success(`${res.ok} photo${res.ok > 1 ? "s" : ""} added to the gallery`);
    if (res.ok < res.total) toast.error(`${res.total - res.ok} file(s) could not be processed`);
  }

  function onDragStart(e: React.DragEvent, id: string) {
    setDragId(id);
    e.dataTransfer.setData("text/plain", id);
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    const fromId = e.dataTransfer.getData("text/plain");
    if (!fromId || fromId === targetId) return;

    const ids = items.map((i) => i.id);
    const from = ids.indexOf(fromId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;

    const newOrder = [...ids];
    const [m] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, m);
    reorder(newOrder);
    setDragId(null);
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> View public site
          </Link>
          <div className="font-serif text-lg text-foreground">Angel’s Studio</div>
          <button onClick={onLock} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut size={15} /> Lock studio
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {/* Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="rounded-3xl border-2 border-dashed border-terracotta/40 bg-background p-9 text-center shadow-soft"
        >
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-terracotta/10 text-terracotta">
            <Upload size={28} />
          </div>
          <h2 className="mt-4 font-serif text-2xl">Add fresh bakes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Drag &amp; drop or tap below. Multiple photos welcome.</p>
          <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-terracotta px-9 py-4 text-sm font-medium uppercase tracking-[0.15em] text-cream shadow-warm">
            <Plus size={17} /> Choose photos from phone or computer
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          </label>
          <p className="mt-3 text-xs text-muted-foreground/70">Images stay private in your browser’s storage</p>
        </div>

        {/* Inventory */}
        <div className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="font-serif text-2xl">Your gallery ({items.length})</h3>
            <p className="text-xs text-muted-foreground">Drag cards or use arrows to reorder</p>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
              No photos yet. Use the big upload area above to add your first bakes.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, item.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, item.id)}
                  className="group flex gap-4 rounded-2xl border border-border bg-background p-3 shadow-soft transition active:scale-[0.995]"
                >
                  <div className="relative h-24 w-24 flex-none overflow-hidden rounded-xl border border-border/60">
                    <img src={item.imageData} alt={item.title} className="h-full w-full object-cover" />
                    {item.isFeatured && (
                      <div className="absolute right-1 top-1 rounded bg-terracotta px-1.5 py-px text-[9px] text-cream">★</div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="line-clamp-1 font-serif text-[17px] leading-tight">{item.title}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-wider text-terracotta">{item.category}</div>
                    {item.description && (
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <MiniBtn onClick={() => setEditing(item)}><Edit2 size={14} /> Edit</MiniBtn>
                      <MiniBtn onClick={() => update(item.id, { isFeatured: !item.isFeatured })}>
                        <Star size={14} className={item.isFeatured ? "fill-current" : ""} /> {item.isFeatured ? "Unfeature" : "Feature"}
                      </MiniBtn>
                      <MiniBtn danger onClick={() => { if (confirm("Delete?")) remove(item.id); }}>
                        <Trash2 size={14} /> Delete
                      </MiniBtn>
                      <MiniBtn onClick={() => move(item.id, -1)}><ArrowUp size={14} /></MiniBtn>
                      <MiniBtn onClick={() => move(item.id, 1)}><ArrowDown size={14} /></MiniBtn>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-background/70 p-5 text-center text-xs text-muted-foreground">
          All changes save automatically in this browser. To move your photos to another device, download them from the public gallery or take screenshots for reference.
        </div>
      </div>

      {editing && (
        <EditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            toast.success("Saved");
          }}
          onDelete={() => {
            remove(editing.id);
            setEditing(null);
            toast.success("Deleted");
          }}
        />
      )}
    </div>
  );
}

function MiniBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition active:scale-95",
        danger
          ? "border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
          : "border-border text-foreground/70 hover:bg-secondary"
      )}
    >
      {children}
    </button>
  );
}

function EditDialog({ item, onClose, onSave, onDelete }: any) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState<Category>(item.category);
  const [isFeatured, setIsFeatured] = useState(item.isFeatured);

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-cocoa/70 p-0 md:items-center md:justify-center md:p-6" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-background p-6 md:rounded-3xl" onClick={e => e.stopPropagation()}>
        <img src={item.imageData} className="mb-4 h-40 w-full rounded-2xl object-cover" alt="" />
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">TITLE</div>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-xl border border-border px-4 py-2.5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">CATEGORY</div>
            <select value={category} onChange={e => setCategory(e.target.value as Category)} className="w-full rounded-xl border border-border px-4 py-2.5">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">DESCRIPTION</div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-xl border border-border px-4 py-2.5" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-terracotta" />
            Feature on homepage
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onDelete} className="rounded-full border border-destructive/30 py-3 text-sm text-destructive">Delete</button>
          <button onClick={() => onSave({ title, description, category, isFeatured })} className="rounded-full bg-terracotta py-3 text-sm text-cream">Save</button>
        </div>
      </div>
    </div>
  );
}

function cn(...c: any[]) { return c.filter(Boolean).join(" "); }
