import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true, specs: true };

async function requireSeller() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.seller.findUnique({ where: { userId: session.user.id } });
}

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const data = await request.json();
  try {
    const input = validateProductInput(data);
    const product = await prisma.product.create({
      data: {
        name: input.name,
        category: input.category,
        price: input.price,
        installments: input.installments,
        condition: input.condition,
        inStock: input.inStock,
        description: input.description,
        videoUrl: input.videoUrl,
        sellerId: seller.id,
        images: { create: input.images.map((url, order) => ({ url, order })) },
        specs: { create: input.specs.map((s, order) => ({ label: s.label, value: s.value, order })) },
      },
      include: PRODUCT_INCLUDE,
    });
    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
