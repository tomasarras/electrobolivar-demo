import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true, specs: true };

async function requireOwnedProduct(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: NextResponse.json({ error: "Producto no encontrado" }, { status: 404 }) };
  if (product.sellerId !== seller.id) {
    return { error: NextResponse.json({ error: "Este producto no es tuyo" }, { status: 403 }) };
  }
  return { seller, product };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

  const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

  const data = await request.json();
  try {
    const input = validateProductInput(data);
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productSpec.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        category: input.category,
        price: input.price,
        installments: input.installments,
        condition: input.condition,
        inStock: input.inStock,
        description: input.description,
        videoUrl: input.videoUrl,
        images: { create: input.images.map((url, order) => ({ url, order })) },
        specs: { create: input.specs.map((s, order) => ({ label: s.label, value: s.value, order })) },
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
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
