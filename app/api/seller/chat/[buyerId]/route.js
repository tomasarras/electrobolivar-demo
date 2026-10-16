import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSeller() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.seller.findUnique({ where: { userId: session.user.id } });
}

export async function GET(request, { params }) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { buyerId } = await params;

  const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { id: true, name: true, email: true } });
  if (!buyer) return NextResponse.json({ error: "Comprador no encontrado" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { buyerId, sellerId: seller.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.chatMessage.updateMany({
    where: { buyerId, sellerId: seller.id, sender: "buyer", read: false },
    data: { read: true },
  });

  return NextResponse.json({ buyer, messages });
}

export async function POST(request, { params }) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { buyerId } = await params;

  const buyer = await prisma.user.findUnique({ where: { id: buyerId }, select: { id: true } });
  if (!buyer) return NextResponse.json({ error: "Comprador no encontrado" }, { status: 404 });

  const { body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí un mensaje" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { buyerId, sellerId: seller.id, sender: "seller", body: text },
  });
  return NextResponse.json(message, { status: 201 });
}
