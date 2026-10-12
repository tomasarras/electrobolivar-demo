import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.orderItem.findMany({
    select: {
      productId: true,
      productName: true,
      unitPrice: true,
      qty: true,
      product: {
        select: {
          category: true,
          images: { take: 1, orderBy: { order: "asc" } },
        },
      },
    },
  });

  const byProduct = new Map();
  let totalQty = 0;
  let totalRevenue = 0;

  for (const item of items) {
    const key = item.productId || `deleted:${item.productName}`;
    const gross = item.unitPrice * item.qty;
    totalQty += item.qty;
    totalRevenue += gross;

    const existing = byProduct.get(key);
    if (existing) {
      existing.qty += item.qty;
      existing.revenue += gross;
    } else {
      byProduct.set(key, {
        productId: item.productId,
        name: item.productName,
        category: item.product?.category || null,
        image: item.product?.images?.[0]?.url || null,
        qty: item.qty,
        revenue: gross,
      });
    }
  }

  const ranking = Array.from(byProduct.values())
    .map((p) => ({ ...p, sharePct: totalQty > 0 ? (p.qty / totalQty) * 100 : 0 }))
    .sort((a, b) => b.qty - a.qty);

  const orderCount = await prisma.order.count();

  const visitsByDevice = await prisma.visit.groupBy({ by: ["device"], _count: { device: true } });
  const totalVisits = visitsByDevice.reduce((sum, v) => sum + v._count.device, 0);
  const devices = ["mobile", "desktop"].map((device) => {
    const count = visitsByDevice.find((v) => v.device === device)?._count.device || 0;
    return { device, count, sharePct: totalVisits > 0 ? (count / totalVisits) * 100 : 0 };
  });

  return NextResponse.json({
    summary: { totalQty, totalRevenue, orderCount, distinctProducts: ranking.length },
    ranking,
    devices: { total: totalVisits, items: devices },
  });
}
