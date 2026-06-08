import { useEffect, useMemo, useState, useRef } from "react";
import { useGallery } from "@/hooks/useGallery";
import { useAdmin } from "@/hooks/useAdmin";
import { CATEGORIES, type Category, type GalleryItem } from "@/lib/gallery";
import { cn } from "@/lib/utils";
import { X, Plus, Trash2, Star, Edit2, ArrowUp, ArrowDown, Upload, LogOut, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type UploadProgress = {
  id: string;
  name: string;
  progress: number; // 0-100
  done: boolean;
};

const ALL = "All" as const;

export function GallerySection() {
  const { items, addPhotos, update, remove, move, reorder } = useGallery();
  const admin = useAdmin();

  const [filter, setFilter] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Premium upload experience
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hidden file inputs for different flows (library multi + camera quick capture)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Always-fresh items ref for post-upload auto-edit (avoids stale closure)
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const filtered = useMemo(
    () => (filter === ALL ? items : items.filter((b) => b.category === filter)),
    [items, filter]
  );

  const tabs = [ALL, ...CATEGORIES] as const;

  // Lightbox navigation (prev/next within current filter view)
  const lightboxIndex = lightbox ? filtered.findIndex((i) => i.id === lightbox.id) : -1;
  function goToLightbox(delta: -1 | 1) {
    if (lightboxIndex < 0) return;
    const nextIdx = (lightboxIndex + delta + filtered.length) % filtered.length;
    setLightbox(filtered[nextIdx]);
  }

  // Keyboard support for lightbox + editing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else if (editing) setEditing(null);
      }
      if (lightbox) {
        if (e.key === "ArrowLeft") goToLightbox(-1);
        if (e.key === "ArrowRight") goToLightbox(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, editing, lightboxIndex]);

  // --- Premium Admin upload handling with progress + delightful feedback ---
  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;

    // Initialize beautiful per-file progress UI
    const initialProgress: UploadProgress[] = fileArr.map((f, idx) => ({
      id: `u-${Date.now()}-${idx}`,
      name: f.name.length > 26 ? f.name.slice(0, 23) + "…" : f.name,
      progress: 6,
      done: false,
    }));
    setUploadProgress(initialProgress);
    setIsProcessing(true);

    // Simulate realistic compression stages + real processing
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) =>
        prev.map((p, i) => {
          if (p.done) return p;
          const target = 18 + i * 4;
          const next = Math.min(92, p.progress + (p.progress < 55 ? 13 : 7));
          return { ...p, progress: next > target ? next : target };
        })
      );
    }, 110);

    try {
      const res = await addPhotos(fileArr);

      clearInterval(progressInterval);

      // Complete the progress bars elegantly
      setUploadProgress((prev) =>
        prev.map((p, idx) => ({
          ...p,
          progress: idx < res.ok ? 100 : p.progress,
          done: idx < res.ok,
        }))
      );

      if (res.ok > 0) {
        const plural = res.ok === 1 ? "" : "s";
        toast.success(`${res.ok} beautiful bake${plural} added to the gallery`, {
          description: "Tap the new photo to caption or feature it.",
        });

        // Traveling baker workflow: auto-open the freshest for quick metadata
        setTimeout(() => {
          const latest = itemsRef.current;
          const sorted = [...latest].sort(
            (a, b) => (b.sortOrder - a.sortOrder) || (b.createdAt > a.createdAt ? 1 : -1)
          );
          if (sorted[0]) setEditing(sorted[0]);
        }, 260);
      }

      if (res.ok < res.total) {
        toast.error(`${res.total - res.ok} file${res.total - res.ok === 1 ? "" : "s"} could not be added`, {
          description: "Check file sizes or formats and try again.",
        });
      }
    } catch (e) {
      clearInterval(progressInterval);
      toast.error("Something went wrong while adding photos");
    } finally {
      // Keep the completed state visible for a delicious moment, then clear
      setTimeout(() => {
        setUploadProgress([]);
        setIsProcessing(false);
      }, 820);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  // --- Reorder via drag & drop (admin only) ---
  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent) {
    if (!admin.isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onDropReorder(e: React.DragEvent, targetId: string) {
    if (!admin.isAdmin) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = filtered.map((i) => i.id);
    const from = currentOrder.indexOf(draggedId);
    const to = currentOrder.indexOf(targetId);
    if (from < 0 || to < 0) return;

    const newOrder = [...currentOrder];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);

    // Preserve relative order of items outside the current filter view, then apply the new visual order to the filtered ones.
    // This keeps drag reordering intuitive within a category or when viewing All.
    const nonFilteredIds = items
      .filter((i) => !filtered.some((f) => f.id === i.id))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => i.id);

    reorder([...nonFilteredIds, ...newOrder]);
  }

  // Simple arrow reordering (very reliable on phones)
  function moveWithinFilter(item: GalleryItem, dir: -1 | 1) {
    // We move globally using the move util (which works on full sorted list)
    move(item.id, dir);
  }

  return (
    <section id="gallery" className="bg-gradient-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="divider-flourish">The Gallery</span>
          <h2 className="mt-5 text-balance font-serif text-4xl text-foreground md:text-6xl">
            Fresh from the oven
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
            A living collection of Angel’s bakes — perfect for showing friends and customers what’s fresh today.
          </p>
        </div>

        {/* Studio toolbar — professional, warm, and extremely easy on mobile */}
        {admin.isAdmin && (
          <div className="mt-8 rounded-3xl border border-terracotta/25 bg-background/95 p-5 shadow-soft backdrop-blur-xl md:p-6 studio-bar">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-4 py-1.5 text-sm font-medium text-terracotta">
                  <Star size={15} className="fill-current" /> Studio Mode
                </span>
                <span className="hidden text-sm text-muted-foreground md:inline">Add • Edit • Reorder • Feature</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={admin.lock}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 px-5 py-2 text-sm font-medium text-foreground/80 transition hover:bg-background hover:text-foreground active:bg-muted"
                >
                  <LogOut size={15} /> Exit Studio
                </button>
                <button
                  onClick={() => {
                    if (confirm("Replace current gallery with the original beautiful demo bakes?")) {
                      localStorage.removeItem("angel_gallery_v1");
                      window.location.reload();
                    }
                  }}
                  className="text-xs text-muted-foreground/70 underline-offset-2 hover:text-foreground/80 underline"
                >
                  Reset to demos
                </button>
              </div>
            </div>

            {/* Dramatically upgraded, huge, mouth-watering upload zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                "upload-dropzone mt-4 rounded-3xl border-2 border-terracotta/35 p-8 text-center md:p-11",
                isDragging && "dragover border-terracotta"
              )}
            >
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-terracotta/10 text-terracotta upload-icon">
                <Upload size={30} />
              </div>
              <p className="font-serif text-2xl tracking-tight text-foreground">Add fresh bakes from the oven</p>
              <p className="mt-1.5 text-[15px] text-muted-foreground">Drag multiple photos here • Perfect for quick traveling menu updates</p>

              {/* Progress UI — beautiful and informative */}
              {uploadProgress.length > 0 && (
                <div className="mx-auto mt-6 max-w-md space-y-2.5 rounded-2xl border border-border/60 bg-background/80 p-4 text-left">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta">
                    <Loader2 size={14} className={cn("animate-spin", !isProcessing && "hidden")} />
                    {isProcessing ? "Compressing & saving" : "Complete"}
                  </div>
                  {uploadProgress.map((u) => (
                    <div key={u.id} className="upload-item flex items-center gap-3 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[13px]">
                          <span className="truncate text-foreground/90 pr-3">{u.name}</span>
                          <span className="tabular-nums text-muted-foreground/70">{u.progress}%</span>
                        </div>
                        <div className="upload-progress mt-1.5">
                          <div className="upload-progress-bar" style={{ width: `${u.progress}%` }} />
                        </div>
                      </div>
                      {u.done && <Check size={17} className="text-terracotta shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <label
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-terracotta px-8 py-3.5 text-sm font-medium uppercase tracking-[0.16em] text-cream shadow-warm active:opacity-90 touch-target"
                >
                  <Plus size={18} /> Choose from library
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />

                <label
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-terracotta/50 bg-background px-6 py-3.5 text-sm font-medium uppercase tracking-[0.16em] text-terracotta active:bg-terracotta/5 touch-target"
                >
                  📷 Take photo
                </label>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                />
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground/70">Photos are privately compressed and stored only on this device</p>
            </div>
          </div>
        )}

        {/* Premium category filters — elegant, large touch targets, delicious active states */}
        <div className="mt-10 overflow-x-auto pb-3 [-webkit-overflow-scrolling:touch]">
          <div className="flex min-w-max justify-center gap-2 md:gap-2.5">
            {tabs.map((t) => {
              const isActive = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "filter-pill touch-target rounded-full px-6 py-2.5 text-sm font-medium whitespace-nowrap active:scale-[0.985]",
                    isActive && "active"
                  )}
                  aria-pressed={isActive}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Masonry Grid — luxurious, generous, perfectly balanced on every screen */}
        {filtered.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border bg-background/60 p-14 text-center">
            <p className="font-serif text-3xl text-foreground">No bakes in this case yet</p>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {admin.isAdmin ? "Upload fresh photos above to fill the display." : "Angel is probably pulling something wonderful out of the oven right now."}
            </p>
            {admin.isAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-7 rounded-full bg-terracotta px-7 py-3 text-sm font-medium text-cream shadow-warm"
              >
                Add your first bake
              </button>
            )}
          </div>
        ) : (
          <div className="mt-9 columns-1 gap-4 sm:columns-2 sm:gap-5 md:columns-3 md:gap-6 lg:columns-4 lg:gap-7 xl:columns-5 xl:gap-7 2xl:columns-6 [&>*]:mb-4 sm:[&>*]:mb-5 [&>*]:break-inside-avoid">
            {filtered.map((item, index) => (
              <button
                key={item.id}
                draggable={admin.isAdmin}
                onDragStart={(e) => admin.isAdmin && onDragStart(e, item.id)}
                onDragOver={onDragOver}
                onDrop={(e) => admin.isAdmin && onDropReorder(e, item.id)}
                onClick={() => setLightbox(item)}
                className={cn(
                  "gallery-card group relative block w-full overflow-hidden rounded-3xl bg-card text-left shadow-soft premium-card active:scale-[0.993]",
                  admin.isAdmin && "ring-1 ring-inset ring-terracotta/10 hover:ring-terracotta/25"
                )}
                style={{ animation: `float-in 520ms cubic-bezier(0.22,1,0.3,1) ${Math.min(index * 0.028, 0.38)}s both` }}
              >
                <div className="relative overflow-hidden bg-[#f6f0e6]">
                  {/* Premium image with lazy loading + elegant fade-in + warm placeholder */}
                  <BakeImage
                    src={item.imageData}
                    alt={item.title}
                    className="bake-img h-auto w-full object-cover"
                  />

                  {/* Rich, appetite-enhancing overlay — magazine-level depth */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/92 via-cocoa/12 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-82" />
                  {/* Delicate warm rim light on hover — makes glazes and crusts glow */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/7 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-70" />

                  {/* Elegant caption area — refined hierarchy */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 pb-5 text-cream">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-cream/18 px-3 py-[3px] text-[10px] font-medium uppercase tracking-[0.2em] backdrop-blur-md ring-1 ring-inset ring-white/10">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="rounded-full bg-terracotta px-2.5 py-[3px] text-[10px] font-medium uppercase tracking-[0.16em] text-cream shadow-sm">Signature</span>
                      )}
                    </div>
                    <p className="mt-2 font-serif text-[17.5px] leading-[1.15] tracking-[-0.01em] drop-shadow-md pr-1">{item.title}</p>
                  </div>

                  {/* Admin floating actions — generous touch targets, beautiful on phone */}
                  {admin.isAdmin && (
                    <div
                      className="absolute right-3 top-3 flex flex-col gap-2 opacity-90 transition-all group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionBtn label="Edit caption & details" onClick={() => setEditing(item)} className="bg-background/90 text-foreground hover:bg-cream">
                        <Edit2 size={15} />
                      </ActionBtn>
                      <ActionBtn
                        label={item.isFeatured ? "Remove from signature" : "Feature as signature"}
                        onClick={() => update(item.id, { isFeatured: !item.isFeatured })}
                        className={item.isFeatured ? "bg-terracotta text-cream" : "bg-background/90 text-foreground hover:bg-cream"}
                      >
                        <Star size={15} className={item.isFeatured ? "fill-current" : ""} />
                      </ActionBtn>
                      <ActionBtn
                        label="Delete this bake"
                        onClick={() => {
                          if (confirm(`Remove “${item.title}”?`)) {
                            remove(item.id);
                            toast.success("Photo removed from the gallery");
                          }
                        }}
                        className="bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 size={15} />
                      </ActionBtn>
                    </div>
                  )}
                </div>

                {/* Admin reorder bar — clean, always visible but unobtrusive, extra friendly on mobile */}
                {admin.isAdmin && (
                  <div
                    className="flex items-center justify-end gap-1 border-t border-border/50 bg-background/70 p-1.5 text-[11px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => moveWithinFilter(item, -1)} className="rounded-full p-2 text-foreground/70 active:bg-terracotta/10 active:text-terracotta touch-target" aria-label="Move earlier in order">
                      <ArrowUp size={15} />
                    </button>
                    <button onClick={() => moveWithinFilter(item, 1)} className="rounded-full p-2 text-foreground/70 active:bg-terracotta/10 active:text-terracotta touch-target" aria-label="Move later in order">
                      <ArrowDown size={15} />
                    </button>
                    <span className="ml-1 mr-1 select-none text-[10px] text-muted-foreground/60">drag to reorder</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Subtle footer note */}
        <p className="mt-10 text-center text-xs text-muted-foreground/70">
          {admin.isAdmin
            ? "Changes save automatically to this browser. Share your device or export photos to move them."
            : "Lovingly baked in Monticello, Kentucky"}
        </p>
      </div>

      {/* Lightbox — breathtaking, immersive, and buttery smooth on every device */}
      {lightbox && (
        <div
          className="lightbox fixed inset-0 z-[80] flex items-center justify-center bg-cocoa/95 p-3 backdrop-blur-xl md:p-6 lg:p-10"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            aria-label="Close lightbox"
            className="absolute right-4 top-4 z-[81] grid h-12 w-12 place-items-center rounded-full bg-cream/10 text-cream backdrop-blur hover:bg-cream/20 active:bg-cream/25 transition touch-target"
            onClick={() => setLightbox(null)}
          >
            <X size={23} />
          </button>

          {/* Large, generous prev/next navigation */}
          {filtered.length > 1 && (
            <>
              <button
                aria-label="Previous photo"
                onClick={(e) => { e.stopPropagation(); goToLightbox(-1); }}
                className="absolute left-3 top-1/2 z-[82] -translate-y-1/2 rounded-2xl bg-cream/10 px-4 py-5 text-2xl text-cream backdrop-blur active:bg-cream/20 md:left-5 md:px-5 touch-target"
              >
                ←
              </button>
              <button
                aria-label="Next photo"
                onClick={(e) => { e.stopPropagation(); goToLightbox(1); }}
                className="absolute right-3 top-1/2 z-[82] -translate-y-1/2 rounded-2xl bg-cream/10 px-4 py-5 text-2xl text-cream backdrop-blur active:bg-cream/20 md:right-5 md:px-5 touch-target"
              >
                →
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-[1080px] overflow-hidden rounded-3xl bg-card shadow-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black/5">
              <img
                src={lightbox.imageData}
                alt={lightbox.title}
                className="lightbox-img max-h-[68vh] md:max-h-[72vh] w-full object-contain"
              />
            </div>

            {/* Beautiful menu-card style info panel */}
            <div className="p-6 md:p-8 lg:p-9">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center rounded-full bg-terracotta/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                  {lightbox.category}
                </span>
                {lightbox.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-terracotta px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cream">
                    <Star size={12} className="fill-current" /> Signature bake
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-serif text-[27px] leading-[1.05] tracking-[-0.015em] text-foreground md:text-[32px]">
                {lightbox.title}
              </h3>

              {lightbox.description && (
                <p className="mt-4 max-w-3xl text-[15.2px] leading-relaxed text-foreground/90">
                  {lightbox.description}
                </p>
              )}

              {filtered.length > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground/75">
                  <span>← → or tap sides to browse • {lightboxIndex + 1} of {filtered.length}</span>
                  <span className="hidden sm:inline">Press ESC to close</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit dialog (touch-friendly) */}
      {editing && (
        <EditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            update(editing.id, patch);
            setEditing(null);
            toast.success("Updated");
          }}
          onDelete={() => {
            if (confirm("Delete this photo permanently?")) {
              remove(editing.id);
              setEditing(null);
              toast.success("Photo deleted");
            }
          }}
        />
      )}

      {/* Floating premium controls — easy on every screen size */}
      {!admin.isAdmin ? (
        <button
          onClick={admin.openPrompt}
          className="fixed bottom-6 right-5 z-50 flex items-center gap-2 rounded-full border border-terracotta/35 bg-background/95 px-5 py-2.5 text-sm font-medium shadow-warm backdrop-blur active:bg-background md:bottom-8 touch-target"
          aria-label="Open Angel’s Studio"
        >
          <Star size={15} className="text-terracotta" />
          <span className="font-medium text-foreground/85">Studio</span>
        </button>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="studio-fab fixed bottom-6 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta text-cream shadow-warm active:scale-[0.935] md:bottom-8 touch-target"
          aria-label="Quick add new bakes"
          title="Add fresh photos"
        >
          <Plus size={26} />
        </button>
      )}

      {/* Password prompt modal */}
      {admin.showPrompt && (
        <PasscodePrompt
          error={admin.error}
          onSubmit={(code) => admin.unlock(code)}
          onClose={admin.closePrompt}
        />
      )}
    </section>
  );
}

function ActionBtn({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-2xl border border-white/25 text-sm shadow active:scale-[0.94] touch-target",
        className
      )}
    >
      {children}
    </button>
  );
}

function EditDialog({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: GalleryItem;
  onClose: () => void;
  onSave: (patch: Partial<Pick<GalleryItem, "title" | "description" | "category" | "isFeatured">>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [category, setCategory] = useState<Category>(item.category);
  const [isFeatured, setIsFeatured] = useState(item.isFeatured);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-cocoa/80 p-0 md:items-center md:p-8" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-t-3xl bg-background p-6 shadow-warm md:rounded-3xl md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-terracotta">Studio • Edit Bake</p>
            <p className="text-sm text-muted-foreground">Update how it appears in the gallery</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:text-foreground active:bg-muted touch-target">
            <X size={22} />
          </button>
        </div>

        {/* Large delicious preview */}
        <div className="overflow-hidden rounded-2xl border border-border edit-preview">
          <img src={item.imageData} alt="" className="h-56 w-full object-cover md:h-64" />
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="input-premium mt-2 w-full rounded-2xl border border-border bg-background px-5 py-3.5 text-[17px] focus:outline-none"
              placeholder="Beautiful name for this bake"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-5 py-2 text-sm font-medium transition touch-target",
                    category === c
                      ? "border-terracotta bg-terracotta text-cream"
                      : "border-border bg-background hover:bg-secondary active:bg-muted"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Description &amp; notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={620}
              placeholder="Flavor profile, special ingredients, story behind the bake…"
              className="textarea-premium mt-2 w-full rounded-2xl border border-border bg-background px-5 py-4 text-[15px] leading-relaxed focus:outline-none"
            />
            <div className="mt-1 text-right text-[10px] text-muted-foreground/60">{description.length}/620</div>
          </div>

          <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-border p-4 active:bg-secondary/70">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mt-0.5 h-5 w-5 accent-terracotta"
            />
            <div className="text-[14.5px] leading-snug">
              <div className="font-medium">Feature as Signature</div>
              <div className="text-muted-foreground text-sm">Show on the homepage in “A few of my favorites”</div>
            </div>
          </label>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onDelete}
            className="flex-1 rounded-full border border-destructive/30 py-3.5 text-sm font-medium text-destructive active:bg-destructive/5"
          >
            Delete this photo
          </button>
          <button
            onClick={() => onSave({ title: title.trim(), description: description.trim(), category, isFeatured })}
            className="flex-1 rounded-full bg-terracotta py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-cream shadow-warm active:opacity-95"
          >
            Save to gallery
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-muted-foreground/70">Saved privately on this device only</p>
      </div>
    </div>
  );
}

function PasscodePrompt({
  error,
  onSubmit,
  onClose,
}: {
  error: string;
  onSubmit: (code: string) => boolean;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = onSubmit(code);
    if (!ok) setCode("");
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-cocoa/90 p-6 backdrop-blur-2xl" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl bg-background p-8 shadow-warm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
            <Star size={21} />
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-terracotta">Private Studio</p>
          <h3 className="mt-1.5 font-serif text-3xl tracking-tight">Angel’s Studio</h3>
          <p className="mt-2 text-[14.5px] text-muted-foreground">Enter your passcode to manage the gallery and add new bakes.</p>
        </div>

        <form onSubmit={submit} className="mt-7">
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-border bg-background px-6 py-5 text-center text-3xl tracking-[0.6em] placeholder:tracking-[0.3em] focus:border-terracotta focus:outline-none"
            aria-label="Studio passcode"
          />
          {error && <p className="mt-2.5 text-center text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={!code || submitting}
            className="mt-5 w-full rounded-full bg-terracotta py-4 text-sm font-semibold uppercase tracking-[0.18em] text-cream disabled:opacity-70 shadow-warm active:opacity-95"
          >
            {submitting ? "Opening the studio…" : "Enter Studio"}
          </button>
        </form>

        <button onClick={onClose} className="mt-5 w-full text-sm text-muted-foreground hover:text-foreground/80">
          Cancel
        </button>

        <p className="mt-7 text-center text-[10px] text-muted-foreground/70 leading-snug">
          This is private to Angel.<br />Everything stays on this device.
        </p>
      </div>
    </div>
  );
}

/* Premium lazy image with warm placeholder + elegant fade for maximum appetite appeal */
function BakeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        className,
        "transition-all duration-700",
        loaded ? "opacity-100" : "opacity-0 scale-[1.01]"
      )}
    />
  );
}
