
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, isSignedIn } from "@/lib/sessions";
import "./booking.css";

function getStatusMessage(status) {
  const messages = {
    Pending: "Your booking is waiting for the owner to respond.",
    "Under Review": "The owner is reviewing your booking request.",
    Accepted: "Good news! The owner has accepted your booking request.",
    Approved: "Your booking has been approved. Check your booking details for the next steps.",
    Declined: "Unfortunately, the owner has declined your booking request.",
    Cancelled: "This booking has been cancelled.",
    Confirmed: "Good news! The owner has confirmed your booking.",
    Rejected: "Unfortunately, the owner has rejected your booking request.",
    Completed: "Your rental has been completed.",
  };

  return messages[status] || `Your current booking status is ${status}.`;
}

function getRenterId(booking) {
  return booking.renterId ?? booking.userId ?? booking.customerId;
}

function canCancelBooking(status) {
  const cancellableStatuses = [
    "pending",
    "under review",
    "accepted",
    "approved",
    "confirmed",
  ];

  return cancellableStatuses.includes(
    String(status || "").toLowerCase()
  );
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

      if (!session?.id) {
        setBookings([]);
        return;
      }

      const saved = JSON.parse(
        localStorage.getItem("rental_bookings") || "[]"
      );

      const allBookings = Array.isArray(saved) ? saved : [];

      const renterBookings = allBookings.filter((booking) => {
        const renterId = getRenterId(booking);

        return (
          renterId != null &&
          String(renterId) === String(session.id)
        );
      });

      setBookings(renterBookings);
    } catch (error) {
      console.error("Failed to load bookings:", error);
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

    function handleBookingUpdate() {
      loadBookings();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener(
      "rental-bookings-updated",
      handleBookingUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "rental-bookings-updated",
        handleBookingUpdate
      );
    };
  }, [authorized, loadBookings]);


  const cancelBooking = useCallback(
    (bookingId) => {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this booking?"
      );

      if (!confirmed) return;

      try {
        const session = getSession();

        if (!session?.id) {
          alert("Please sign in again.");
          router.replace("/signin?next=%2Fbookings");
          return;
        }

        const saved = JSON.parse(
          localStorage.getItem("rental_bookings") || "[]"
        );

        if (!Array.isArray(saved)) {
          throw new Error("Invalid booking data.");
        }

       
        const booking = saved.find((item) => {
          const renterId = getRenterId(item);

          return (
            String(item.id) === String(bookingId) &&
            renterId != null &&
            String(renterId) === String(session.id)
          );
        });

        if (!booking) {
          alert("Booking not found.");
          return;
        }

        if (!canCancelBooking(booking.status)) {
          alert("This booking can no longer be cancelled.");
          return;
        }

        const updatedBookings = saved.map((item) => {
          const renterId = getRenterId(item);

          if (
            String(item.id) === String(bookingId) &&
            renterId != null &&
            String(renterId) === String(session.id)
          ) {
            return {
              ...item,
              status: "Cancelled",
              cancelledAt: new Date().toISOString(),
            };
          }

          return item;
        });

        localStorage.setItem(
          "rental_bookings",
          JSON.stringify(updatedBookings)
        );

      
        loadBookings();

        window.dispatchEvent(
          new Event("rental-bookings-updated")
        );
      } catch (error) {
        console.error("Booking cancellation failed:", error);
        alert("Unable to cancel the booking. Please try again.");
      }
    },
    [loadBookings, router]
  );

  if (!authorized) {
    return <main className="my-bookings" />;
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

          <h2 id="mb">My Bookings</h2>

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

            const statusClass = String(status)
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

           
                {canCancelBooking(status) && (
                  <button
                    type="button"
                    className="cancel-booking-button"
                    onClick={() => cancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}

               
                {String(status).toLowerCase() === "completed" && (
                  <Link
                    href={`/bookings/${encodeURIComponent(
                      String(booking.id)
                    )}/review`}
                    className="write-review-link"
                  >
                    Feed-back
                  </Link>
                )}

                {/* Dispute link */}
                <Link
                  href={`/disputes/new?carId=${encodeURIComponent(
                    String(booking.carId ?? "")
                  )}&bookingId=${encodeURIComponent(
                    String(booking.id ?? "")
                  )}`}  className="rp"
                >
                  Report-Poblem
                </Link>
              </article>
            );
          })}
        </section>
      )}

      <Link href="/dashboard" className="vd">Visit Dashboard</Link>
    </main>
  );
}
