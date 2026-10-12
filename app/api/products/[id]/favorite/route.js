import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request, { params }) {
  const { id } = await params;
  const { action } = await request.json();
  if (action !== "add" && action !== "remove") {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: { favoriteCount: { increment: action === "add" ? 1 : -1 } },
    select: { favoriteCount: true },
  });
  return NextResponse.json({ favoriteCount: Math.max(0, product.favoriteCount) });
}
