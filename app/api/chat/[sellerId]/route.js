import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { sellerId } = await params;

  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, select: { id: true, storeName: true } });
  if (!seller) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { buyerId: session.user.id, sellerId },
    orderBy: { createdAt: "asc" },
  });

  await prisma.chatMessage.updateMany({
    where: { buyerId: session.user.id, sellerId, sender: "seller", read: false },
    data: { read: true },
  });

  return NextResponse.json({ seller, messages });
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { sellerId } = await params;

  const seller = await prisma.seller.findUnique({ where: { id: sellerId }, select: { id: true } });
  if (!seller) return NextResponse.json({ error: "Vendedor no encontrado" }, { status: 404 });

  const { body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí un mensaje" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { buyerId: session.user.id, sellerId, sender: "buyer", body: text },
  });
  return NextResponse.json(message, { status: 201 });
}
