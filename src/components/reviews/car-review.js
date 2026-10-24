


"use client";

import { useEffect, useState } from "react";
import {
  getCarReviews,
  getAverageRating,
} from "@/lib/reviewStorage";

export default function CarReviews({ carId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    function loadReviews() {
      setReviews(getCarReviews(carId));
      setAverage(getAverageRating(carId));
    }

    loadReviews();

    window.addEventListener("reviews-updated", loadReviews);

    return () => {
      window.removeEventListener("reviews-updated", loadReviews);
    };
  }, [carId]);

  return (
    <section className="car-reviews">
      <h2>Customer reviews</h2>

      {reviews.length > 0 ? (
        <>
          <p>
            <strong>★ {average.toFixed(1)} / 5</strong>
            {" "}({reviews.length} reviews)
          </p>

          {reviews.map((review) => (
            <article key={review.id} className="review-item">
              <p>
                <strong>{"★".repeat(review.rating)}</strong>
                {" "}{review.rating}/5
              </p>

              <p>{review.comment}</p>

              <small>
                {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </article>
          ))}
        </>
      ) : (
        <p>No reviews yet. Be the first to review this car!</p>
      )}
    </section>
  );
}
