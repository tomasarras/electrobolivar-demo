import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.orderItem.findUnique({
    where: { id },
    include: { order: { select: { code: true, deliveryMethod: true, buyerId: true } } },
  });
  if (!item || item.sellerId !== seller.id) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  if (item.order.deliveryMethod !== "envio") {
    return NextResponse.json({ error: "Este pedido no es de envío a domicilio" }, { status: 400 });
  }
  if (item.status !== "enviado") {
    return NextResponse.json({ error: "Primero marcá el producto como enviado" }, { status: 409 });
  }
  if (item.sellerDeliveredAt) {
    return NextResponse.json({ error: "Este producto ya fue marcado como entregado" }, { status: 409 });
  }

  // Ojo: esto NO libera el pago todavía — solo habilita que el comprador
  // confirme o rechace la recepción (o se libere solo pasadas 48hs).
  const updated = await prisma.orderItem.update({
    where: { id: item.id },
    data: { sellerDeliveredAt: new Date() },
  });

  if (item.order.buyerId) {
    await prisma.notification.create({
      data: {
        buyerId: item.order.buyerId,
        orderId: item.orderId,
        message: `Tu pedido #${item.order.code} fue entregado — "${item.productName}". Confirmá que lo recibiste o avisanos si hubo algún problema.`,
      },
    });
  }

  return NextResponse.json(updated);
}
