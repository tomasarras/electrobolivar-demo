import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/products";

export async function GET(request, { params }) {
  const { id } = await params;
  const [seller, products] = await Promise.all([
    prisma.seller.findUnique({ where: { id }, select: { id: true, storeName: true } }),
    prisma.product.findMany({
      where: { sellerId: id },
      include: { images: true, specs: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!seller) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });
  return NextResponse.json({ seller, products: products.map(serializeProduct) });
}
