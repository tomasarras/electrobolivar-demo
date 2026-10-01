import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, province: true, locality: true, address: true },
  });
  return NextResponse.json(user);
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const data = await request.json();
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      province: (data.province || "").trim() || null,
      locality: (data.locality || "").trim() || null,
      address: (data.address || "").trim() || null,
    },
    select: { name: true, email: true, province: true, locality: true, address: true },
  });
  return NextResponse.json(user);
}
