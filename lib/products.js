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
    inStock: product.inStock,
    description: product.description,
    videoUrl: product.videoUrl,
    images: (product.images || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ id: img.id, url: img.url })),
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
  return {
    name,
    category,
    price: Math.round(price),
    installments: data.installments ? String(data.installments).trim() : null,
    inStock: data.inStock !== false,
    description: data.description ? String(data.description).trim() : null,
    videoUrl: data.videoUrl ? String(data.videoUrl).trim() : null,
    images,
  };
}
