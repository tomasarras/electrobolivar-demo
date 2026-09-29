import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true };

export async function GET(request, { params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json();
  try {
    const input = validateProductInput(data);
    await prisma.productImage.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
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
    return NextResponse.json(serializeProduct(product));
  } catch (err) {
    if (err instanceof ProductError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
