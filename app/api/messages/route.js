import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { productId, about, name, body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí tu mensaje" }, { status: 400 });

  let product = null;
  if (productId) {
    product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true } });
  }

  const session = await getServerSession(authOptions);
  const senderName = session?.user?.name || session?.user?.email || (name || "").trim() || null;

  const message = await prisma.message.create({
    data: {
      productId: product?.id || null,
      productName: product?.name || null,
      about: about === "vendedor" ? "vendedor" : about === "devolucion" ? "devolucion" : "producto",
      name: senderName,
      body: text,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
