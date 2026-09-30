import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request, { params }) {
  const { id } = await params;
  await prisma.promoImage.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
