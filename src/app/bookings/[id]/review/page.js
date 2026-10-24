"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import ReviewForm from "@/components/reviews/review-form";
import { getBookings } from "@/components/bookings/booking-status";
import { getSession } from "@/lib/sessions";

function ReviewPageContent() {
  const params = useParams();
  const bookingId = params?.id;

  const [booking, setBooking] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const currentSession = getSession();
      const bookings = getBookings();

      const foundBooking = bookings.find(
        (item) => String(item.id) === String(bookingId)
      );

      setSession(currentSession);

      if (!foundBooking) {
        setMessage("Booking not found.");
      } else if (!currentSession) {
        setMessage("Please sign in to review your rental.");
      } else {
        const renterId =
          foundBooking.renterId ??
          foundBooking.userId ??
          foundBooking.customerId;

        if (
          renterId == null ||
          String(renterId) !== String(currentSession.id)
        ) {
          setMessage("You are not authorized to review this booking.");
        } else if (
          String(foundBooking.status).toLowerCase() !== "completed"
        ) {
          setMessage("You can review this car after the booking is completed.");
        } else {
          setBooking(foundBooking);
        }
      }
    } catch (error) {
      console.error("Error loading booking:", error);
      setMessage("Unable to load this booking.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  if (loading) {
    return <main><p>Loading booking...</p></main>;
  }

  if (!booking) {
    return (
      <main>
        <h1>Write a review</h1>
        <p>{message}</p>
        <Link href="/bookings">Back to bookings</Link>
      </main>
    );
  }

  const carId = booking.carId ?? booking.car?.id;

  if (carId == null) {
    return (
      <main>
        <h1>Write a review</h1>
        <p>This booking does not contain a car ID.</p>
        <Link href="/bookings">Back to bookings</Link>
      </main>
    );
  }

  return (
    <main className="review-page">
    
      <p>Booking ID: {booking.id}</p>

      <ReviewForm
        carId={carId}
        bookingId={booking.id}
        renterId={session.id}
      />
    </main>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<main><p>Loading review page...</p></main>}>
      <ReviewPageContent />
    </Suspense>
  );
}