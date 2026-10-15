import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.orderItem.findMany({
    where: { sellerId: { not: null } },
    select: { currency: true, commissionAmt: true, unitPrice: true, qty: true },
  });

  const byCurrency = { ARS: { commission: 0, gross: 0, items: 0 }, USD: { commission: 0, gross: 0, items: 0 } };
  for (const item of items) {
    const bucket = item.currency === "USD" ? byCurrency.USD : byCurrency.ARS;
    bucket.commission += item.commissionAmt;
    bucket.gross += item.unitPrice * item.qty;
    bucket.items += item.qty;
  }

  return NextResponse.json(byCurrency);
}
