import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectDevice } from "@/lib/device";

export async function POST(request) {
  const device = detectDevice(request.headers.get("user-agent"));
  await prisma.visit.create({ data: { device } });
  return NextResponse.json({ ok: true });
}
