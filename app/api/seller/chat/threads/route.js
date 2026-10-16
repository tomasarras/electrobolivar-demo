import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSeller() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.seller.findUnique({ where: { userId: session.user.id } });
}

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { id: true, name: true, email: true } } },
  });

  const byBuyer = new Map();
  for (const m of messages) {
    if (!byBuyer.has(m.buyerId)) {
      byBuyer.set(m.buyerId, {
        buyerId: m.buyerId,
        buyerName: m.buyer.name || m.buyer.email,
        lastMessage: m.body,
        lastAt: m.createdAt,
        unreadCount: 0,
      });
    }
    const thread = byBuyer.get(m.buyerId);
    if (m.sender === "buyer" && !m.read) thread.unreadCount += 1;
  }

  return NextResponse.json(Array.from(byBuyer.values()));
}
