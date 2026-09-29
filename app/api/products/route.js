import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true };

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("categoria");

  const products = await prisma.product.findMany({
    where: category ? { category } : undefined,
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request) {
  const data = await request.json();
  try {
    const input = validateProductInput(data);
    const product = await prisma.product.create({
      data: {
        name: input.name,
        category: input.category,
        price: input.price,
        installments: input.installments,
        inStock: input.inStock,
        description: input.description,
        videoUrl: input.videoUrl,
        images: { create: input.images.map((url, order) => ({ url, order })) },
      },
      include: PRODUCT_INCLUDE,
    });
    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
