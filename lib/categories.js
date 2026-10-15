// Fixed taxonomy (not DB-backed): a home-appliance store has a small, stable
// set of departments, unlike Vestra's open-ended clothing categories.
export const CATEGORIES = [
  { slug: "cocina", label: "Tecnología", icon: "CookingPot" },
  { slug: "lavado", label: "Electro", icon: "WashingMachine" },
  { slug: "climatizacion", label: "Hogar", icon: "AirVent" },
  { slug: "pequenos", label: "Belleza", icon: "Blender" },
  { slug: "ropa", label: "Ropa", icon: "Shirt" },
  { slug: "vehiculos", label: "Vehículos", icon: "Car" },
  { slug: "inmobiliaria", label: "Inmobiliaria", icon: "Building2" },
  { slug: "herramientas", label: "Herramientas", icon: "Wrench" },
  { slug: "otros", label: "Otros", icon: "Package" },
];

export function categoryLabel(slug) {
  return CATEGORIES.find((c) => c.slug === slug)?.label || slug;
}
