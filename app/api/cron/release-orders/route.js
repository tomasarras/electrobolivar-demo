import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DELIVERY_HOLD_HOURS } from "@/lib/delivery";

async function releaseExpiredOrders() {
  const cutoff = new Date(Date.now() - DELIVERY_HOLD_HOURS * 60 * 60 * 1000);
  const result = await prisma.orderItem.updateMany({
    where: { status: "enviado", sellerDeliveredAt: { lte: cutoff } },
    data: { status: "entregado", deliveredAt: new Date() },
  });
  return result.count;
}

// Invocado por el Vercel Cron Job (vercel.json). Libera automáticamente el
// pago de los envíos a domicilio que el comprador nunca confirmó ni rechazó
// dentro de las 48hs de que el vendedor los marcó "Ya entregado". Vercel
// siempre llama a los crons por GET.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const released = await releaseExpiredOrders();
    return NextResponse.json({ ok: true, released });
  } catch (err) {
    console.error("release-orders cron failed", err);
    return NextResponse.json({ error: "No se pudo liberar los pagos" }, { status: 500 });
  }
}
