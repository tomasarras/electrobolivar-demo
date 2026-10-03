export function totalSold(orderItems) {
  return (orderItems || []).reduce((sum, item) => sum + item.qty, 0);
}
