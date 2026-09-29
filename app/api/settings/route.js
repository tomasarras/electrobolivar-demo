import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ whatsapp: settings?.whatsapp || "" });
}

export async function PATCH(request) {
  const data = await request.json();
  const whatsapp = (data.whatsapp || "").replace(/\D/g, "");
  if (!whatsapp) return NextResponse.json({ error: "Ingresá un número válido" }, { status: 400 });
  await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: { whatsapp },
    create: { id: "singleton", whatsapp },
  });
  return NextResponse.json({ whatsapp });
}
