import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commissionAmount } from "@/lib/commission";

export async function POST(request) {
  const { code, items, deliveryMethod, address, contactPhone, paymentMethod, deliveryNote } = await request.json();
  if (!code || !items?.length) {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  const commissionPct = settings?.commissionPct ?? 10;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
    select: { id: true, sellerId: true },
  });
  const sellerByProduct = new Map(products.map((p) => [p.id, p.sellerId]));

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = await prisma.order.create({
    data: {
      code,
      buyerId: session?.user?.id || null,
      paymentMethod: paymentMethod || "desconocido",
      deliveryMethod: deliveryMethod || "retiro",
      address: address || null,
      contactPhone: contactPhone || null,
      deliveryNote: (deliveryNote || "").trim() || null,
      total,
      items: {
        create: items.map((item) => {
          const sellerId = sellerByProduct.get(item.productId) || null;
          return {
            productId: item.productId,
            productName: item.name,
            unitPrice: item.price,
            qty: item.qty,
            sellerId,
            commissionPct: sellerId ? commissionPct : 0,
            commissionAmt: sellerId ? commissionAmount(item.price, item.qty, commissionPct) : 0,
          };
        }),
      },
    },
    select: {
      id: true,
      code: true,
      items: { select: { id: true, productId: true, productName: true } },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
