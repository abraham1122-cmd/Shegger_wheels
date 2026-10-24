


"use client";

import { useState } from "react";
import { addReview } from "@/lib/reviewStorage";
import Link from "next/link";

export default function ReviewForm({ carId, bookingId, renterId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!comment.trim()) {
      setMessage("Please write a review.");
      return;
    }

    const saved = addReview({
      carId,
      bookingId,
      renterId,
      rating,
      comment: comment.trim(),
    });

    setMessage(
      saved
        ? "Your review was submitted successfully."
        : "A review has already been submitted for this booking."
    );

    if (saved) setComment("");
  }

  return (

    <>
    <form onSubmit={handleSubmit} className="review-form">
      <h2>Rate your rental</h2>

      <label>Rating</label>

      <div className="rating-input" aria-label="Choose a rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={rating === star}
            className={star <= rating ? "star active" : "star"}
          >
            ★
          </button>
        ))}
      </div>

      <p>{rating} out of 5 stars</p>

      <label htmlFor="review-comment">Your review</label>

      <textarea
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="How was the car and rental experience?"
        rows={4}
        maxLength={1000}
        required
      />

      <button type="submit">Submit review</button>

      {message && <p role="status">{message}</p>}


      <div>
        <Link  className="rfb"  href="/bookings">Bookings</Link>
      </div>

    </form>


     
    
     </>
  );
}
