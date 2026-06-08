export const CATEGORIES = [
  "Artisan Breads",
  "Cakes",
  "Donuts & Beignets",
  "Bagels",
  "Pastries",
  "Seasonal",
  "Cookies",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type GalleryItem = {
  id: string;
  title: string;
  description: string;
  category: Category;
  imageData: string; // data URL (base64)
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
};

const STORAGE_KEY = "angel_gallery_v1";
const ADMIN_PASSCODE = "angelbakes2026";

let cachedItems: GalleryItem[] | null = null;

// Map legacy category names (from previous versions) to the current ones
const LEGACY_CATEGORY_MAP: Record<string, Category> = {
  "Breads": "Artisan Breads",
  "Donuts": "Donuts & Beignets",
  "Artisan Breads": "Artisan Breads",
  "Cakes & Tortes": "Cakes",
  "Donuts & Beignets": "Donuts & Beignets",
};

function normalizeCategory(cat: string): Category {
  if ((CATEGORIES as readonly string[]).includes(cat)) return cat as Category;
  return LEGACY_CATEGORY_MAP[cat] || "Pastries";
}

function loadFromStorage(): GalleryItem[] {
  if (cachedItems) return cachedItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedItems = getSeedItems();
      persist(cachedItems);
      return cachedItems;
    }
    let parsed = JSON.parse(raw) as GalleryItem[];
    if (!Array.isArray(parsed)) parsed = getSeedItems();

    // Normalize any legacy categories + ensure shape
    const normalized = parsed.map((item) => ({
      ...item,
      category: normalizeCategory(item.category),
      description: item.description || "",
    }));

    cachedItems = normalized;
    // Persist normalized so future loads are clean
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized)); } catch {}
    return cachedItems;
  } catch {
    cachedItems = getSeedItems();
    return cachedItems;
  }
}

function persist(items: GalleryItem[]) {
  cachedItems = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to persist gallery (storage full?)", e);
  }
}

// Compress image client-side for phone uploads. Returns a JPEG data URL.
export async function compressImageToDataUrl(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });

  let { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // Always output as JPEG for size
  return canvas.toDataURL("image/jpeg", quality);
}

export function getItems(): GalleryItem[] {
  return [...loadFromStorage()].sort((a, b) => a.sortOrder - b.sortOrder || (a.createdAt < b.createdAt ? 1 : -1));
}

export function getFeaturedItems(limit = 8): GalleryItem[] {
  const all = getItems();
  const featured = all.filter((i) => i.isFeatured);
  if (featured.length > 0) return featured.slice(0, limit);
  // graceful fallback: first N by sort
  return all.slice(0, limit);
}

export function addItems(newItems: Omit<GalleryItem, "id" | "sortOrder" | "createdAt">[]): GalleryItem[] {
  const current = loadFromStorage();
  const maxOrder = current.length > 0 ? Math.max(...current.map((i) => i.sortOrder)) : 0;
  const toAdd: GalleryItem[] = newItems.map((it, idx) => ({
    ...it,
    id: crypto.randomUUID(),
    sortOrder: maxOrder + 1 + idx,
    createdAt: new Date().toISOString(),
  }));
  const updated = [...current, ...toAdd];
  persist(updated);
  return getItems();
}

export function updateItem(id: string, patch: Partial<Pick<GalleryItem, "title" | "description" | "category" | "isFeatured">>): GalleryItem[] {
  const current = loadFromStorage();
  const updated = current.map((item) =>
    item.id === id
      ? {
          ...item,
          title: patch.title !== undefined ? patch.title.trim().slice(0, 120) : item.title,
          description: patch.description !== undefined ? patch.description.trim().slice(0, 600) : item.description,
          category: patch.category ?? item.category,
          isFeatured: patch.isFeatured ?? item.isFeatured,
        }
      : item
  );
  persist(updated);
  return getItems();
}

export function deleteItem(id: string): GalleryItem[] {
  const current = loadFromStorage();
  const updated = current.filter((i) => i.id !== id);
  // re-normalize order to keep things tidy
  const reOrdered = updated
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((it, idx) => ({ ...it, sortOrder: idx + 1 }));
  persist(reOrdered);
  return getItems();
}

export function reorderItem(id: string, direction: -1 | 1): GalleryItem[] {
  const current = [...loadFromStorage()].sort((a, b) => a.sortOrder - b.sortOrder);
  const idx = current.findIndex((i) => i.id === id);
  if (idx < 0) return current;
  const swapIdx = idx + direction;
  if (swapIdx < 0 || swapIdx >= current.length) return current;

  const a = current[idx];
  const b = current[swapIdx];
  const aOrder = a.sortOrder;
  current[idx] = { ...a, sortOrder: b.sortOrder };
  current[swapIdx] = { ...b, sortOrder: aOrder };

  persist(current);
  return getItems();
}

// Full reorder supporting drag & drop (newOrder is array of ids in desired visual order)
export function reorderItems(newOrderIds: string[]): GalleryItem[] {
  const current = loadFromStorage();
  const map = new Map(current.map((i) => [i.id, i]));
  const reOrdered: GalleryItem[] = newOrderIds
    .map((id, index) => {
      const item = map.get(id);
      return item ? { ...item, sortOrder: index + 1 } : null;
    })
    .filter(Boolean) as GalleryItem[];
  // append any missing (shouldn't happen)
  const seen = new Set(newOrderIds);
  const missing = current.filter((i) => !seen.has(i.id)).sort((a, b) => a.sortOrder - b.sortOrder);
  const final = [...reOrdered, ...missing.map((m, i) => ({ ...m, sortOrder: reOrdered.length + i + 1 }))];
  persist(final);
  return getItems();
}

export function clearAllForDev() {
  // Not exposed in UI; useful if needed
  localStorage.removeItem(STORAGE_KEY);
  cachedItems = null;
}

// Beautiful initial seed so the portfolio looks premium on first load.
// Angel can immediately replace these with her own photos.
function getSeedItems(): GalleryItem[] {
  const now = new Date().toISOString();
  const base: Omit<GalleryItem, "id" | "sortOrder" | "createdAt">[] = [
    {
      title: "Country Sourdough",
      description: "Naturally leavened with a shattering crust and open, airy crumb. 36-hour cold ferment.",
      category: "Artisan Breads",
      imageData: "https://picsum.photos/id/292/1200/1400",
      isFeatured: true,
    },
    {
      title: "Brown Butter Brioche",
      description: "Incredibly soft, enriched with cultured butter and farm eggs. Perfect for French toast or morning toast.",
      category: "Artisan Breads",
      imageData: "https://picsum.photos/id/312/1200/1400",
      isFeatured: true,
    },
    {
      title: "Olive Oil Citrus Cake",
      description: "Bright Meyer lemon, grassy olive oil, and a whisper of vanilla. Finished with candied peel.",
      category: "Cakes",
      imageData: "https://picsum.photos/id/106/1200/1400",
      isFeatured: true,
    },
    {
      title: "Maple Old-Fashioned Donuts",
      description: "Hand-cut yeast donuts, fried to golden, dipped in real maple glaze and toasted pecans.",
      category: "Donuts & Beignets",
      imageData: "https://picsum.photos/id/160/1200/1400",
      isFeatured: true,
    },
    {
      title: "Sesame Bagels",
      description: "Boiled then baked for chew and shine. Toasted sesame seeds, creamy schmear ready.",
      category: "Bagels",
      imageData: "https://picsum.photos/id/251/1200/1400",
      isFeatured: false,
    },
    {
      title: "Strawberry Rhubarb Hand Pies",
      description: "Flaky all-butter crust, tart-sweet filling, demerara sugar crust. Summer in every bite.",
      category: "Pastries",
      imageData: "https://picsum.photos/id/201/1200/1400",
      isFeatured: true,
    },
    {
      title: "Pumpkin Spice Loaf",
      description: "Moist, warmly spiced, with a crunchy cinnamon-sugar top. Our autumn signature.",
      category: "Seasonal",
      imageData: "https://picsum.photos/id/133/1200/1400",
      isFeatured: true,
    },
    {
      title: "Brown Butter Pecan Cookies",
      description: "Crispy edges, chewy centers, pools of toffee and toasted pecans. Dangerously good.",
      category: "Cookies",
      imageData: "https://picsum.photos/id/58/1200/1400",
      isFeatured: false,
    },
    {
      title: "Chocolate Espresso Torte",
      description: "Deep 70% chocolate, a shot of espresso, and a dusting of cocoa. For celebrations.",
      category: "Cakes",
      imageData: "https://picsum.photos/id/318/1200/1400",
      isFeatured: false,
    },
    {
      title: "Everything Bagels",
      description: "Garlic, onion, sesame, poppy, and flaky salt. The classic that never gets old.",
      category: "Bagels",
      imageData: "https://picsum.photos/id/30/1200/1400",
      isFeatured: false,
    },
  ];

  return base.map((b, i) => ({
    ...b,
    id: `seed-${i}`,
    sortOrder: i + 1,
    createdAt: now,
  }));
}
