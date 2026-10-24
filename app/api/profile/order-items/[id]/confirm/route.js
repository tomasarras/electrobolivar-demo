import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { received } = await request.json();
  const { id } = await params;

  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { order: { select: { buyerId: true } } },
  });
  if (!item || item.order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  // El comprador puede confirmar la recepción tanto si el vendedor ya marcó
  // el envío como "enviado" como si todavía no lo hizo ("pendiente") —
  // cubre el caso de que ya tenga el producto en mano.
  if (item.status !== "pendiente" && item.status !== "enviado") {
    return NextResponse.json({ error: "Este producto no está esperando confirmación" }, { status: 409 });
  }

  if (received) {
    const updated = await prisma.orderItem.update({
      where: { id: item.id },
      data: { status: "entregado", deliveredAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.orderItem.update({
      where: { id: item.id },
      data: { status: "cancelado", cancelledAt: new Date() },
    });
    if (item.productId) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.qty } } });
    }
    return cancelled;
  });
  return NextResponse.json(updated);
}
