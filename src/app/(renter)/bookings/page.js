
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, isSignedIn } from "@/lib/sessions";
import "./booking.css";

function getStatusMessage(status) {
  const messages = {
    Pending:
      "Your booking is waiting for the owner to respond.",
    "Under Review":
      "The owner is reviewing your booking request.",
    Accepted:
      "Good news! The owner has accepted your booking request.",
    Approved:
      "Your booking has been approved. Check your booking details for the next steps.",
    Declined:
      "Unfortunately, the owner has declined your booking request.",
    Cancelled:
      "This booking has been cancelled.",
    Confirmed:
      "Good news! The owner has confirmed your booking.",
    Rejected:
      "Unfortunately, the owner has rejected your booking request.",
    Completed:
      "Your rental has been completed.",
  };

  return messages[status] || `Your current booking status is ${status}.`;
}

export default function MyBookingsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/signin?next=%2Fbookings");
      return;
    }

    setAuthorized(true);
  }, [router]);

  const loadBookings = useCallback(() => {
    try {
      const session = getSession();
      const saved = JSON.parse(
        localStorage.getItem("rental_bookings") || "[]"
      );

      const allBookings = Array.isArray(saved) ? saved : [];

     

    const renterBookings = allBookings.filter((booking) => {
       const renterId =
            booking.renterId ??
            booking.userId ??
            booking.customerId;

    return (
       renterId != null &&
       String(renterId) === String(session?.id)
     );
   });

      setBookings(renterBookings);
    } catch {
      setBookings([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;

    loadBookings();

    function handleStorageChange(event) {
      if (
        event.key === "rental_bookings" ||
        event.key === null
      ) {
        loadBookings();
      }
    }

    function handleFocus() {
      loadBookings();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [authorized, loadBookings]);

  if (!authorized) {
    return (
      <main className="my-bookings">
        <p>Checking authorization...</p>
      </main>
    );
  }

  if (!loaded) {
    return (
      <main className="my-bookings">
        <p>Loading bookings...</p>
      </main>
    );
  }

  return (
    <main className="my-bookings">
      <header className="bookings-header">
        <div>
          <span className="bookings-eyebrow">
            YOUR RENTALS
          </span>

          <h1>My Bookings</h1>

          <p>
            Track your reservations and check their latest status.
          </p>
        </div>

        <Link href="/cars" className="browse-cars-link">
          Browse Cars
        </Link>
      </header>

      {bookings.length === 0 ? (
        <section className="empty-bookings">
          <h2>No bookings yet</h2>

          <p>
            Your car reservations will appear here after you
            confirm a booking.
          </p>

          <Link href="/cars">Find a car</Link>
        </section>
      ) : (
        <section className="booking-list">
          {bookings.map((booking, index) => {
            const status = booking.status || "Pending";

            const statusClass = status
              .toLowerCase()
              .replace(/\s+/g, "-");

            return (
              <article
                className="renter-booking-card"
                key={booking.id || `${booking.carId}-${index}`}
              >
                <div className="renter-booking-top">
                  <div>
                    <span className="booking-reference">
                      Booking #{booking.id || index + 1}
                    </span>

                    <h2>{booking.carName || "Rental car"}</h2>
                  </div>

                  <span
                    className={`booking-status ${statusClass}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="renter-booking-details">
                  <div>
                    <span>Pickup date</span>
                    <strong>
                      {booking.pickUpDate || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Return date</span>
                    <strong>
                      {booking.returnDate || "Not provided"}
                    </strong>
                  </div>

                  <div>
                    <span>Rental duration</span>
                    <strong>
                      {booking.rentalDays ?? "—"} day(s)
                    </strong>
                  </div>

                  <div>
                    <span>Total price</span>
                    <strong>
                      {Number.isFinite(Number(booking.totalPrice))
                        ? `ETB ${Number(
                            booking.totalPrice
                          ).toLocaleString()}`
                        : "Not available"}
                    </strong>
                  </div>
                </div>

                <div className="booking-status-message">
                  <strong>Booking update</strong>
                  <p>{getStatusMessage(status)}</p>
                </div>

              {String(status).toLowerCase() === "completed" && (
                       <Link
                        href={`/bookings/${encodeURIComponent(String(booking.id))}/review`}
                     className="write-review-link"  >
                        Feed-back
                        </Link>
                        )}
                

                <Link href={`/disputes/new?carId=${encodeURIComponent(booking.carId)}&bookingId=${
                  encodeURIComponent(booking.id)}`}>

                    Report-Poblem
                  </Link>
              </article>
            );
          })}
        </section>
      )}

    </main>
  );
}
