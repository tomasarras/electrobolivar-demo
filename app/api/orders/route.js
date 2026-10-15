import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commissionAmount } from "@/lib/commission";
import { formatCurrency } from "@/lib/format";

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
    select: { id: true, sellerId: true, currency: true },
  });
  const sellerByProduct = new Map(products.map((p) => [p.id, p.sellerId]));
  const currencyByProduct = new Map(products.map((p) => [p.id, p.currency || "ARS"]));

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
            currency: currencyByProduct.get(item.productId) || "ARS",
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
      items: { select: { id: true, productId: true, productName: true, qty: true, unitPrice: true, sellerId: true } },
    },
  });

  const itemsBySeller = new Map();
  for (const item of order.items) {
    if (!item.sellerId) continue;
    if (!itemsBySeller.has(item.sellerId)) itemsBySeller.set(item.sellerId, []);
    itemsBySeller.get(item.sellerId).push(item);
  }
  if (itemsBySeller.size) {
    await prisma.notification.createMany({
      data: Array.from(itemsBySeller.entries()).map(([sellerId, sellerItems]) => ({
        sellerId,
        message:
          sellerItems.length === 1
            ? `Vendiste ${sellerItems[0].qty}x "${sellerItems[0].productName}" (${formatCurrency(sellerItems[0].unitPrice * sellerItems[0].qty)}) · Pedido #${order.code}`
            : `Nueva venta: ${sellerItems.length} productos del pedido #${order.code}`,
      })),
    });
  }

  return NextResponse.json(order, { status: 201 });
}
