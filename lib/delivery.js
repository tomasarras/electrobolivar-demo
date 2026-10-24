// Cuánto tiempo queda retenido el pago de un envío a domicilio después de
// que el vendedor lo marca como enviado, antes de liberarse automáticamente.
export const DELIVERY_HOLD_HOURS = 48;

export function deliveryDeadline(shippedAt) {
  if (!shippedAt) return null;
  return new Date(new Date(shippedAt).getTime() + DELIVERY_HOLD_HOURS * 60 * 60 * 1000);
}
