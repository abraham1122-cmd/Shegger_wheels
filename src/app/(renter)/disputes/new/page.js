
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import DisputeForm from "@/components/disputes/dispute-form";
import { getSession } from "@/lib/sessions";
import { getListedCars } from "@/lib/carStorage";
import carsData from "@/data/cars.json";

import "../renterDisputes.css";


function NewDisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const carId = searchParams.get("carId");
  const bookingId = searchParams.get("bookingId");

  const [currentUser, setCurrentUser] = useState(null);
  const [car, setCar] = useState(null);
  const [ownerId, setOwnerId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const session = getSession();

      const user = session
        ? { ...session, id: session.id ?? session.userId }
        : null;

      if (!user?.id || user.role !== "renter") {
        setError("Please sign in with a renter account.");
        return;
      }

      if (!carId) {
        setError("A car ID is required to submit a dispute.");
        return;
      }

      const bookings = JSON.parse(
        localStorage.getItem("rental_bookings") || "[]"
      );

      if (!Array.isArray(bookings)) {
        throw new Error("Invalid booking data.");
      }

      let selectedBooking = null;

      if (bookingId) {
        selectedBooking = bookings.find(
          (booking) =>
            String(booking.id) === bookingId &&
            String(booking.renterId) === String(user.id)
        );

        if (!selectedBooking) {
          setError("This booking was not found in your bookings.");
          return;
        }

        if (String(selectedBooking.carId) !== String(carId)) {
          setError("The car does not match the selected booking.");
          return;
        }
      }

      const listedCars = getListedCars();

      const allCars = [
        ...(Array.isArray(carsData) ? carsData : []),
        ...(Array.isArray(listedCars) ? listedCars : []),
      ];

      const selectedCar = allCars.find(
        (item) => String(item.id) === String(carId)
      );

      if (!selectedCar) {
        setError("The selected car could not be found.");
        return;
      }

      const resolvedOwnerId =
        selectedBooking?.ownerId || selectedCar.ownerId;

      if (!resolvedOwnerId) {
        setError(
          "This car has no owner ID. Add ownerId to the car data before submitting a dispute."
        );
        return;
      }

      setCurrentUser(user);
      setCar(selectedCar);
      setOwnerId(String(resolvedOwnerId));
      setError("");
    } catch {
      setError("Unable to load the selected car or booking.");
    } finally {
      setLoading(false);
    }
  }, [carId, bookingId]);

  if (loading) {
    return (
      <main className="new-dispute-page">
        <div className="new-dispute-container">
          <p className="new-dispute-loading">
            Loading dispute form...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="new-dispute-page">
        <div className="new-dispute-container">
          <section className="new-dispute-error">
            <h1>Cannot submit dispute</h1>
            <p>{error}</p>

            <Link
              href="/bookings"
              className="new-dispute-button"
            >
              Return to bookings
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (!currentUser || !car) {
    return (
      <main className="new-dispute-page">
        <div className="new-dispute-container">
          <section className="new-dispute-error">
            <h1>Cannot submit dispute</h1>
            <p>The renter or car information is unavailable.</p>

            <Link
              href="/bookings"
              className="new-dispute-button"
            >
              Return to bookings
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="new-dispute-page">
      <div className="new-dispute-container">
        <Link
          href="/disputes"
          className="new-dispute-back-link"
        >
          &larr; Back to my disputes
        </Link>

        <header className="new-dispute-header">
          <h1>Report a Problem</h1>
          <p>Submit a complaint related to this rental car.</p>
        </header>

        <section className="new-dispute-car-card">
          <h2>
            {car.name ||
              `${car.brand || ""} ${car.model || ""}`.trim() ||
              "Selected car"}
          </h2>

          <p>Car ID: {car.id}</p>

          {bookingId && <p>Booking ID: {bookingId}</p>}
        </section>

        <section className="new-dispute-form-panel">
          <DisputeForm
            mode="create"
            currentUser={currentUser}
            bookingId={bookingId || null}
            carId={car.id}
            renterId={currentUser.id}
            ownerId={ownerId}
            onSuccess={() => router.push("/disputes")}
          />
        </section>
      </div>
    </main>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense
      fallback={
        <main className="new-dispute-page">
          <div className="new-dispute-container">
            <p className="new-dispute-loading">
              Loading dispute form...
            </p>
          </div>
        </main>
      }
    >
      <NewDisputeContent />
    </Suspense>
  );
}
