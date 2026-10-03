import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ whatsapp: settings?.whatsapp || "", commissionPct: settings?.commissionPct ?? 10 });
}

export async function PATCH(request) {
  const data = await request.json();
  const whatsapp = (data.whatsapp || "").replace(/\D/g, "");
  if (!whatsapp) return NextResponse.json({ error: "Ingresá un número válido" }, { status: 400 });

  let commissionPct;
  if (data.commissionPct !== undefined) {
    commissionPct = Number(data.commissionPct);
    if (!Number.isFinite(commissionPct) || commissionPct < 0 || commissionPct > 100) {
      return NextResponse.json({ error: "La comisión debe ser un número entre 0 y 100" }, { status: 400 });
    }
    commissionPct = Math.round(commissionPct);
  }

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: { whatsapp, ...(commissionPct !== undefined ? { commissionPct } : {}) },
    create: { id: "singleton", whatsapp, ...(commissionPct !== undefined ? { commissionPct } : {}) },
  });
  return NextResponse.json({ whatsapp: settings.whatsapp, commissionPct: settings.commissionPct });
}
