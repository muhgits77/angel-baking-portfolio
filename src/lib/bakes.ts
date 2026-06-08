// Re-export the new client-side gallery types (pure localStorage, no Supabase).
// Categories now match the requested set for the traveling menu: Artisan Breads, Cakes, Donuts & Beignets, etc.
export { CATEGORIES, type Category, type GalleryItem as Bake } from "./gallery";

// Legacy type alias kept for any stray references during migration.
export type { GalleryItem as BakeLegacy } from "./gallery";
