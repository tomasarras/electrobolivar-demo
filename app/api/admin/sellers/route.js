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

  const result = sellers.map((seller) => {
    const gross = seller.orderItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const commission = seller.orderItems.reduce((sum, i) => sum + i.commissionAmt, 0);
    return {
      id: seller.id,
      storeName: seller.storeName,
      whatsapp: seller.whatsapp,
      productCount: seller.products.length,
      gross,
      commission,
      net: gross - commission,
      createdAt: seller.createdAt,
    };
  });

  return NextResponse.json(result);
}
