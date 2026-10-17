import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PHOTOS = 4;

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { orderItemId, urls } = await request.json();
  const cleanUrls = Array.isArray(urls) ? urls.filter(Boolean).slice(0, MAX_PHOTOS) : [];
  if (!orderItemId || !cleanUrls.length) {
    return NextResponse.json({ error: "Faltan fotos" }, { status: 400 });
  }

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: { select: { buyerId: true } } },
  });
  if (!orderItem || !orderItem.productId || orderItem.order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "No se encontró la compra" }, { status: 404 });
  }

  const photos = await prisma.$transaction(
    cleanUrls.map((url, order) =>
      prisma.deliveryPhoto.create({
        data: {
          productId: orderItem.productId,
          orderItemId,
          buyerId: session.user.id,
          buyerName: session.user.name || null,
          url,
          order,
        },
      })
    )
  );

  return NextResponse.json(photos, { status: 201 });
}
