// Fixed taxonomy (not DB-backed): a home-appliance store has a small, stable
// set of departments, unlike Vestra's open-ended clothing categories.
export const CATEGORIES = [
  { slug: "cocina", label: "Cocina", icon: "CookingPot" },
  { slug: "frio", label: "Cámaras", icon: "Refrigerator" },
  { slug: "lavado", label: "Lavado", icon: "WashingMachine" },
  { slug: "climatizacion", label: "Climatización", icon: "AirVent" },
  { slug: "pequenos", label: "Pequeños", icon: "Blender" },
];

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
