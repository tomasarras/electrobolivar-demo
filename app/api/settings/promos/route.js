import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePromo, validatePromoInput, PromoError } from "@/lib/promos";

export async function GET() {
  const promos = await prisma.promoImage.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(promos.map(serializePromo));
}

export async function POST(request) {
  const data = await request.json();
  try {
    const input = validatePromoInput(data);
    const last = await prisma.promoImage.findFirst({ orderBy: { order: "desc" } });
    const promo = await prisma.promoImage.create({
      data: { ...input, order: (last?.order ?? -1) + 1 },
    });
    return NextResponse.json(serializePromo(promo), { status: 201 });
  } catch (err) {
    if (err instanceof PromoError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
