




const REVIEWS_KEY = "rental_reviews";

export function getReviews() {
  if (typeof window === "undefined") return [];

  try {
    const reviews = JSON.parse(
      localStorage.getItem(REVIEWS_KEY) || "[]"
    );

    return Array.isArray(reviews) ? reviews : [];
  } catch {
    return [];
  }  
}

export function getCarReviews(carId) {
  return getReviews().filter(
    (review) => String(review.carId) === String(carId)
  );
}

export function getAverageRating(carId) {
  const reviews = getCarReviews(carId);

  if (reviews.length === 0) return 0;

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating),
    0
  );

  return Number((total / reviews.length).toFixed(1));
}

export function addReview(review) {
  if (typeof window === "undefined") return false;

  const reviews = getReviews();

  const alreadyReviewed = reviews.some(
    (item) =>
      String(item.bookingId) === String(review.bookingId)
  );

  if (alreadyReviewed) return false;

  const newReview = {
    ...review,
    id: crypto.randomUUID(),
    rating: Number(review.rating),
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    REVIEWS_KEY,
    JSON.stringify([...reviews, newReview])
  );

  window.dispatchEvent(new Event("reviews-updated"));

  return true;
}
