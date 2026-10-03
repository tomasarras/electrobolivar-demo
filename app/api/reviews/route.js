import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { orderItemId, rating, comment, buyerName } = await request.json();

  const ratingNum = Number(rating);
  if (!orderItemId || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "Reseña inválida" }, { status: 400 });
  }

  const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId } });
  if (!orderItem || !orderItem.productId) {
    return NextResponse.json({ error: "No se encontró la compra" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);

  try {
    const review = await prisma.review.create({
      data: {
        productId: orderItem.productId,
        orderItemId,
        buyerId: session?.user?.id || null,
        buyerName: session?.user?.name || (buyerName || "").trim() || null,
        rating: ratingNum,
        comment: (comment || "").trim() || null,
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (err) {
    if (err.code === "P2002") return NextResponse.json({ error: "Ese pedido ya tiene una reseña" }, { status: 409 });
    throw err;
  }
}
