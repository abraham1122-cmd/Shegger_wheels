
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

    // Repair missing/duplicate IDs in saved records.
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
      <main className="mx-auto max-w-5xl p-6">
        Loading bookings...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Booking Requests
      </h1>

      {error && (
        <p role="alert" className="mb-4 text-red-600">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <p>No booking requests for your cars yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-xl border p-5"
            >
              <h2 className="text-xl font-semibold">
                {booking.carName || "Car"}
              </h2>

              <p>
                Renter:{" "}
                {booking.renterName ||
                  booking.fullName ||
                  "Renter"}
              </p>

              <p>
                Pickup: {booking.pickUpDate || "Not specified"}
              </p>

              <p>
                Return: {booking.returnDate || "Not specified"}
              </p>

              <p>
                Total: ETB{" "}
                {Number(booking.totalPrice || 0).toLocaleString("en-US")}
              </p>

              <p className="my-3">
                Current status:{" "}
                <strong>{booking.status || "Pending"}</strong>
              </p>

              <label
                htmlFor={`booking-status-${booking.id}`}
                className="mb-2 block font-medium"
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
                className="w-full rounded-lg border p-3"
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
