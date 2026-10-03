import { CATEGORIES } from "@/lib/categories";

export class ProductError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    installments: product.installments,
    condition: product.condition || "nuevo",
    inStock: product.inStock,
    description: product.description,
    videoUrl: product.videoUrl,
    sellerId: product.sellerId || null,
    seller: product.seller ? { storeName: product.seller.storeName } : null,
    images: (product.images || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ id: img.id, url: img.url })),
    specs: (product.specs || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((spec) => ({ id: spec.id, label: spec.label, value: spec.value })),
    createdAt: product.createdAt,
  };
}

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function validateProductInput(data) {
  const name = (data.name || "").trim();
  if (!name) throw new ProductError("Falta el nombre del producto", 400);
  const category = CATEGORY_SLUGS.includes(data.category) ? data.category : CATEGORY_SLUGS[0];
  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) throw new ProductError("El precio no es válido", 400);
  const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  const specs = Array.isArray(data.specs)
    ? data.specs
        .map((s) => ({ label: String(s?.label || "").trim(), value: String(s?.value || "").trim() }))
        .filter((s) => s.label && s.value)
    : [];
  return {
    name,
    category,
    price: Math.round(price),
    installments: data.installments ? String(data.installments).trim() : null,
    condition: data.condition === "usado" ? "usado" : "nuevo",
    inStock: data.inStock !== false,
    description: data.description ? String(data.description).trim() : null,
    videoUrl: data.videoUrl ? String(data.videoUrl).trim() : null,
    images,
    specs,
  };
}
