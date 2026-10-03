import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(seller);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const existing = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (existing) return NextResponse.json({ error: "Ya tenés una cuenta de vendedor" }, { status: 409 });

  const data = await request.json();
  const storeName = (data.storeName || "").trim();
  if (!storeName) return NextResponse.json({ error: "Falta el nombre de tu tienda" }, { status: 400 });
  const whatsapp = (data.whatsapp || "").replace(/\D/g, "") || null;

  const seller = await prisma.seller.create({
    data: { userId: session.user.id, storeName, whatsapp },
  });
  return NextResponse.json(seller, { status: 201 });
}
