export function averageRating(reviews) {
  if (!reviews?.length) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
