import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const items = await prisma.orderItem.findMany({
    where: { sellerId: seller.id },
    include: { order: { select: { code: true, createdAt: true, paymentMethod: true, deliveryNote: true } } },
    orderBy: { order: { createdAt: "desc" } },
  });

  const summary = items.reduce(
    (acc, item) => {
      const gross = item.unitPrice * item.qty;
      acc.gross += gross;
      acc.commission += item.commissionAmt;
      return acc;
    },
    { gross: 0, commission: 0 }
  );
  summary.net = summary.gross - summary.commission;

  return NextResponse.json({ items, summary });
}
