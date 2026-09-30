export class PromoError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializePromo(promo) {
  return {
    id: promo.id,
    mobileUrl: promo.mobileUrl,
    desktopUrl: promo.desktopUrl,
    alt: promo.alt,
    order: promo.order,
  };
}

export function validatePromoInput(data) {
  const mobileUrl = (data.mobileUrl || "").trim();
  const desktopUrl = (data.desktopUrl || "").trim();
  const alt = (data.alt || "").trim();
  if (!mobileUrl) throw new PromoError("Falta la imagen para mobile", 400);
  if (!desktopUrl) throw new PromoError("Falta la imagen para escritorio", 400);
  if (!alt) throw new PromoError("Falta una descripción de la publicidad", 400);
  return { mobileUrl, desktopUrl, alt };
}
