export function commissionAmount(unitPrice, qty, pct) {
  return Math.round((unitPrice * qty * pct) / 100);
}
