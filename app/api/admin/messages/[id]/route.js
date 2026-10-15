import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.message.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
