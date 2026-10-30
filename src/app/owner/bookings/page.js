
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBookings,
  updateBookingStatus,
  repairBookingIds,
  BOOKING_STATUSES,
} from "@/components/bookings/booking-status";
import { getSession } from "@/lib/sessions";
import { getListedCars } from "@/lib/carStorage";

import "@/app/owner/cars/owner-car.css";

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadBookings = useCallback(() => {
    const session = getSession();

    if (!session || session.role !== "owner") {
      setBookings([]);
      setLoaded(true);
      return;
    }

    repairBookingIds();

    const ownerCars = getListedCars(session.id);
    const ownerCarIds = new Set(
      ownerCars.map((car) => String(car.id))
    );

    const ownerBookings = getBookings().filter((booking) => {
      const carId =
        booking.carId ??
        booking.car?.id ??
        booking.vehicleId;

      return (
        carId != null &&
        ownerCarIds.has(String(carId))
      );
    });

    setBookings(ownerBookings);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadBookings();

    function handleStorageChange(event) {
      if (
        event.key === "rental_bookings" ||
        event.key === "rental_cars" ||
        event.key === null
      ) {
        loadBookings();
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadBookings]);

  function handleStatusChange(bookingId, newStatus) {
    setError("");

    try {
      updateBookingStatus(bookingId, newStatus);
      loadBookings();
    } catch (err) {
      setError(err.message || "Could not update booking.");
    }
  }

  if (!loaded) {
    return (
      <main className="owner-bookings-page">
        Loading...
      </main>
    );
  }

  return (
    <main className="owner-bookings-page">

      <h2 className="owner-bookings-title">
        Booking Requests
      </h2>

      {error && (
        <p role="alert" className="owner-bookings-error">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <p className="owner-bookings-empty">
          No booking requests for your cars yet.
        </p>
      ) : (
        <div className="owner-bookings-list">

          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="owner-booking-card"
            >

              <h2 className="owner-booking-car-name">
                {booking.carName || "Car"}
              </h2>

              <div className="owner-booking-details">

                <p>
                  <strong>Renter:</strong>{" "}
                  {booking.renterName ||
                    booking.fullName ||
                    "Renter"}
                </p>

                <p>
                  <strong>Pickup:</strong>{" "}
                  {booking.pickUpDate || "Not specified"}
                </p>

                <p>
                  <strong>Return:</strong>{" "}
                  {booking.returnDate || "Not specified"}
                </p>

                <p>
                  <strong>Total:</strong>{" "}
                  ETB{" "}
                  {Number(booking.totalPrice || 0).toLocaleString("en-US")}
                </p>

              </div>

              <p className="owner-booking-current-status">
                Current status:{" "}
                <strong>{booking.status || "Pending"}</strong>
              </p>

              <label
                htmlFor={`booking-status-${booking.id}`}
                className="owner-booking-label"
              >
                Update booking status
              </label>

              <select
                id={`booking-status-${booking.id}`}
                value={
                  BOOKING_STATUSES.includes(booking.status)
                    ? booking.status
                    : "Pending"
                }
                onChange={(event) =>
                  handleStatusChange(
                    booking.id,
                    event.target.value
                  )
                }
                className="owner-booking-select"
              >
                {BOOKING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

            </article>
          ))}

        </div>
      )}

    </main>
  );
}
