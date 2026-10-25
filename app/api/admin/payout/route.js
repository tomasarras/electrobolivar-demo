import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    payoutBank: settings?.payoutBank || "",
    payoutHolderName: settings?.payoutHolderName || "",
    payoutHolderDni: settings?.payoutHolderDni || "",
    payoutCbu: settings?.payoutCbu || "",
    payoutAlias: settings?.payoutAlias || "",
  });
}

export async function PATCH(request) {
  const data = await request.json();
  const payout = {
    payoutBank: data.payoutBank ? String(data.payoutBank).trim() : null,
    payoutHolderName: data.payoutHolderName ? String(data.payoutHolderName).trim() : null,
    payoutHolderDni: data.payoutHolderDni ? String(data.payoutHolderDni).trim() : null,
    payoutCbu: data.payoutCbu ? String(data.payoutCbu).trim() : null,
    payoutAlias: data.payoutAlias ? String(data.payoutAlias).trim() : null,
  };

  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: payout,
    create: { id: "singleton", ...payout },
  });
  return NextResponse.json({
    payoutBank: settings.payoutBank || "",
    payoutHolderName: settings.payoutHolderName || "",
    payoutHolderDni: settings.payoutHolderDni || "",
    payoutCbu: settings.payoutCbu || "",
    payoutAlias: settings.payoutAlias || "",
  });
}
