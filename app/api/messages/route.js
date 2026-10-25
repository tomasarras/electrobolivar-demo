import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { productId, orderId, about, name, body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí tu mensaje" }, { status: 400 });

  let product = null;
  if (productId) {
    product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, name: true, sellerId: true } });
  }

  const session = await getServerSession(authOptions);
  const senderName = session?.user?.name || session?.user?.email || (name || "").trim() || null;

  const normalizedAbout = about === "vendedor" ? "vendedor" : about === "devolucion" ? "devolucion" : "producto";

  const message = await prisma.message.create({
    data: {
      productId: product?.id || null,
      productName: product?.name || null,
      about: normalizedAbout,
      name: senderName,
      body: text,
    },
  });

  // Además del aviso al admin, el vendedor recibe una notificación con el
  // pedido vinculado para ver los datos de contacto del comprador.
  if (normalizedAbout === "devolucion" && product?.sellerId && orderId) {
    await prisma.notification.create({
      data: {
        sellerId: product.sellerId,
        orderId,
        message: `Devolución solicitada — ${text}`,
      },
    });
  }

  return NextResponse.json(message, { status: 201 });
}
