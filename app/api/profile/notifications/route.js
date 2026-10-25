import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { buyerId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { order: { select: { code: true } } },
    }),
    prisma.notification.count({ where: { buyerId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { buyerId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
