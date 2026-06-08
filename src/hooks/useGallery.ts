import { useEffect, useState, useCallback } from "react";
import {
  GalleryItem,
  Category,
  getItems,
  getFeaturedItems,
  addItems,
  updateItem,
  deleteItem,
  reorderItem,
  reorderItems,
  compressImageToDataUrl,
} from "@/lib/gallery";

export function useGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => getItems());
  const [featured, setFeatured] = useState<GalleryItem[]>(() => getFeaturedItems());

  const refresh = useCallback(() => {
    const fresh = getItems();
    setItems(fresh);
    setFeatured(getFeaturedItems());
  }, []);

  // Keep in sync if another tab updates localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "angel_gallery_v1") refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const addPhotos = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (arr.length === 0) return { ok: 0, total: 0, newIds: [] as string[] };

      const prepared: { title: string; description: string; category: Category; imageData: string; isFeatured: boolean }[] = [];

      for (const file of arr) {
        try {
          const dataUrl = await compressImageToDataUrl(file);
          const baseTitle = file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const title = baseTitle ? baseTitle.charAt(0).toUpperCase() + baseTitle.slice(1) : "Fresh bake";
          prepared.push({
            title,
            description: "",
            category: "Pastries",
            imageData: dataUrl,
            isFeatured: false,
          });
        } catch (e) {
          console.error("Failed to process image", e);
        }
      }

      let newIds: string[] = [];
      if (prepared.length > 0) {
        const beforeIds = new Set(getItems().map(i => i.id));
        const updated = addItems(prepared);
        setItems(updated);
        setFeatured(getFeaturedItems());
        newIds = updated.filter(i => !beforeIds.has(i.id)).map(i => i.id);
      }
      return { ok: prepared.length, total: arr.length, newIds };
    },
    []
  );

  const update = useCallback((id: string, patch: Partial<Pick<GalleryItem, "title" | "description" | "category" | "isFeatured">>) => {
    const updated = updateItem(id, patch);
    setItems(updated);
    setFeatured(getFeaturedItems());
  }, []);

  const remove = useCallback((id: string) => {
    const updated = deleteItem(id);
    setItems(updated);
    setFeatured(getFeaturedItems());
  }, []);

  const move = useCallback((id: string, direction: -1 | 1) => {
    const updated = reorderItem(id, direction);
    setItems(updated);
    setFeatured(getFeaturedItems());
  }, []);

  const reorder = useCallback((orderedIds: string[]) => {
    const updated = reorderItems(orderedIds);
    setItems(updated);
    setFeatured(getFeaturedItems());
  }, []);

  return {
    items,
    featured,
    addPhotos,
    update,
    remove,
    move,
    reorder,
    refresh,
  };
}
