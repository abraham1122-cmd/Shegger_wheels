


"use client";

import { useCallback, useEffect, useState } from "react";
import { getBookings } from "@/components/bookings/booking-status";
import { getSession } from "@/lib/sessions";
import { getListedCars } from "@/lib/carStorage";

const ACTIVE_STATUSES = ["Accepted", "Approved"];

function formatETB(amount) {
  return `ETB ${Number(amount || 0).toLocaleString("en-US")}`;
}

export default function OwnerEarningsPage() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const loadEarnings = useCallback(() => {
    const session = getSession();

    if (!session || session.role !== "owner") {
      setAuthorized(false);
      setCars([]);
      setBookings([]);
      setLoaded(true);
      return;
    }

    setAuthorized(true);

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

    setCars(ownerCars);
    setBookings(ownerBookings);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadEarnings();

    function handleStorageChange(event) {
      if (
        event.key === "rental_bookings" ||
        event.key === "rental_cars" ||
        event.key === null
      ) {
        loadEarnings();
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadEarnings]);

  if (!loaded) {
    return <main className="p-6">Loading earnings...</main>;
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold">Owner Earnings</h1>
        <p className="mt-3">
          Please sign in with an owner account to view earnings.
        </p>
      </main>
    );
  }

  const acceptedBookings = bookings.filter((booking) =>
    ACTIVE_STATUSES.includes(booking.status)
  );

  const pendingBookings = bookings.filter((booking) =>
    ["Pending", "Under Review"].includes(booking.status)
  );

  const rejectedBookings = bookings.filter((booking) =>
    ["Rejected", "Cancelled"].includes(booking.status)
  );

  const acceptedValue = acceptedBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0
  );

  const pendingValue = pendingBookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0
  );

  const requestedValue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalPrice || 0),
    0
  );

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Owner workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Earnings Overview
        </h1>
        <p className="mt-2 text-gray-600">
          Review the booking value associated with your cars.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Accepted Booking Value
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatETB(acceptedValue)}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Accepted and approved bookings
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Pending Booking Value
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatETB(pendingValue)}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Awaiting a decision
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            Total Requested Value
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatETB(requestedValue)}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            All booking statuses combined
          </p>
        </article>

        <article className="rounded-xl border p-5">
          <p className="text-sm text-gray-500">
            My Cars
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            {cars.length}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Listings saved for this owner
          </p>
        </article>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">
          Booking Summary by Car
        </h2>

        {cars.length === 0 ? (
          <p className="rounded-xl border p-5">
            You have not added any cars yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4">Car</th>
                  <th className="p-4">Bookings</th>
                  <th className="p-4">Accepted Value</th>
                  <th className="p-4">Pending Value</th>
                </tr>
              </thead>

              <tbody>
                {cars.map((car) => {
                  const carBookings = bookings.filter((booking) => {
                    const carId =
                      booking.carId ??
                      booking.car?.id ??
                      booking.vehicleId;

                    return String(carId) === String(car.id);
                  });

                  const carAcceptedValue = carBookings
                    .filter((booking) =>
                      ACTIVE_STATUSES.includes(booking.status)
                    )
                    .reduce(
                      (sum, booking) =>
                        sum + Number(booking.totalPrice || 0),
                      0
                    );

                  const carPendingValue = carBookings
                    .filter((booking) =>
                      ["Pending", "Under Review"].includes(
                        booking.status
                      )
                    )
                    .reduce(
                      (sum, booking) =>
                        sum + Number(booking.totalPrice || 0),
                      0
                    );

                  return (
                    <tr key={car.id} className="border-t">
                      <td className="p-4 font-medium">
                        {car.name || car.title || "Car"}
                      </td>
                      <td className="p-4">
                        {carBookings.length}
                      </td>
                      <td className="p-4">
                        {formatETB(carAcceptedValue)}
                      </td>
                      <td className="p-4">
                        {formatETB(carPendingValue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border p-5">
        <h2 className="text-lg font-bold">Booking Status Summary</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500">
              Accepted / Approved
            </p>
            <p className="mt-1 text-xl font-semibold">
              {acceptedBookings.length}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Pending / Under Review
            </p>
            <p className="mt-1 text-xl font-semibold">
              {pendingBookings.length}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Rejected / Cancelled
            </p>
            <p className="mt-1 text-xl font-semibold">
              {rejectedBookings.length}
            </p>
          </div>
        </div>
      </section>

      <p className="mt-6 text-sm text-gray-500">
        Booking Value and Earning Recieved
      </p>
    </main>
  );
}
