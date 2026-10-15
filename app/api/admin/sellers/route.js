import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sellers = await prisma.seller.findMany({
    include: {
      products: { select: { id: true } },
      orderItems: { select: { unitPrice: true, qty: true, commissionAmt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const complaintCounts = await prisma.message.groupBy({
    by: ["productId"],
    where: { about: "vendedor", productId: { not: null } },
    _count: true,
  });
  const complaintsByProduct = new Map(complaintCounts.map((c) => [c.productId, c._count]));

  const result = sellers.map((seller) => {
    const gross = seller.orderItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const commission = seller.orderItems.reduce((sum, i) => sum + i.commissionAmt, 0);
    const complaintCount = seller.products.reduce((sum, p) => sum + (complaintsByProduct.get(p.id) || 0), 0);
    return {
      id: seller.id,
      storeName: seller.storeName,
      whatsapp: seller.whatsapp,
      flaggedFraud: seller.flaggedFraud,
      complaintCount,
      productCount: seller.products.length,
      gross,
      commission,
      net: gross - commission,
      createdAt: seller.createdAt,
    };
  });

  return NextResponse.json(result);
}
