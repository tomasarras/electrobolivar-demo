import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [messages, unreadCount] = await Promise.all([
    prisma.message.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.message.count({ where: { read: false } }),
  ]);

  return NextResponse.json({ messages, unreadCount });
}

export async function POST() {
  await prisma.message.updateMany({ where: { read: false }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
