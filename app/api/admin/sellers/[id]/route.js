import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { flaggedFraud } = await request.json();

  const seller = await prisma.seller.update({
    where: { id },
    data: { flaggedFraud: Boolean(flaggedFraud) },
  });
  return NextResponse.json({ id: seller.id, flaggedFraud: seller.flaggedFraud });
}
