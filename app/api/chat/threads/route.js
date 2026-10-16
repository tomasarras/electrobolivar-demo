import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { seller: { select: { id: true, storeName: true } } },
  });

  const bySeller = new Map();
  for (const m of messages) {
    if (!bySeller.has(m.sellerId)) {
      bySeller.set(m.sellerId, {
        sellerId: m.sellerId,
        storeName: m.seller.storeName,
        lastMessage: m.body,
        lastAt: m.createdAt,
        unreadCount: 0,
      });
    }
    const thread = bySeller.get(m.sellerId);
    if (m.sender === "seller" && !m.read) thread.unreadCount += 1;
  }

  return NextResponse.json(Array.from(bySeller.values()));
}
