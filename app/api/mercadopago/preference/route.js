import { NextResponse } from "next/server";
import { Preference } from "mercadopago";
import { mpClient } from "@/lib/mercadopago";

export async function POST(request) {
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: "Mercado Pago no está configurado (falta MP_ACCESS_TOKEN)." }, { status: 500 });
  }

  const { items, orderCode, deliveryMethod, address, contactPhone } = await request.json();
  if (!items?.length || !orderCode) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const deliveryLine = deliveryMethod === "envio" ? `Envío a domicilio${address ? ` - ${address}` : ""}` : "Retiro en el local";

  try {
    const preference = await new Preference(mpClient).create({
      body: {
        items: items.map((item) => ({
          id: item.productId,
          title: item.name,
          quantity: item.qty,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        payer: contactPhone ? { phone: { number: contactPhone } } : undefined,
        external_reference: orderCode,
        statement_descriptor: "MERCADOBOLIVAR",
        metadata: { deliveryLine },
        back_urls: {
          success: `${origin}/carrito?mp_status=success&mp_order=${orderCode}`,
          failure: `${origin}/carrito?mp_status=failure&mp_order=${orderCode}`,
          pending: `${origin}/carrito?mp_status=pending&mp_order=${orderCode}`,
        },
        // auto_return requires an https success URL — MP rejects http://localhost,
        // so in local dev the shopper uses the "volver al sitio" link instead.
        ...(origin.startsWith("https://") ? { auto_return: "approved" } : {}),
      },
    });

    // With sandbox/test credentials, Preference.create returns a sandbox_init_point
    // that opens the test checkout; fall back to init_point when it's not present.
    const checkoutUrl = preference.sandbox_init_point || preference.init_point;
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    return NextResponse.json({ error: err.message || "No se pudo iniciar el pago con Mercado Pago" }, { status: 500 });
  }
}
