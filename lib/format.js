export const DISCOUNT_PERIOD_LABELS = { semana: "esta semana", mes: "este mes", siempre: "siempre" };

export function formatCurrency(value, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);
}
