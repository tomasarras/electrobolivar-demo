import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { productId, about, name, body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí tu mensaje" }, { status: 400 });

  let product = null;
  if (productId) {
    product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true } });
  }

  const message = await prisma.message.create({
    data: {
      productId: product?.id || null,
      productName: product?.name || null,
      about: about === "vendedor" ? "vendedor" : "producto",
      name: (name || "").trim() || null,
      body: text,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
