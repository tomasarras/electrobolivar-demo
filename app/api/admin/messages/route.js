import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [messages, unreadCount] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            seller: {
              select: {
                id: true,
                storeName: true,
                whatsapp: true,
                flaggedFraud: true,
                user: { select: { name: true, email: true, phone: true } },
              },
            },
          },
        },
      },
    }),
    prisma.message.count({ where: { read: false } }),
  ]);

  const result = messages.map(({ product, ...m }) => ({ ...m, seller: product?.seller || null }));
  return NextResponse.json({ messages: result, unreadCount });
}

export async function POST() {
  await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
