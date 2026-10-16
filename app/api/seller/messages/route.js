import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { body } = await request.json();
  const text = (body || "").trim();
  if (!text) return NextResponse.json({ error: "Escribí tu mensaje" }, { status: 400 });

  const message = await prisma.message.create({
    data: {
      about: "soporte",
      name: seller.storeName,
      body: text,
    },
  });
  return NextResponse.json(message, { status: 201 });
}
