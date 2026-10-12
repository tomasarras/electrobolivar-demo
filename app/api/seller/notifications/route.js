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

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.notification.count({ where: { sellerId: seller.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { sellerId: seller.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
