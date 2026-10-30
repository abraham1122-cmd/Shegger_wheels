


"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import carsData from "@/data/cars.json";
import { checkCarAvailability } from "@/lib/availability";
import { Suspense } from "react";


function AvailabilityContent() {
  const { id } = useParams();
  const router = useRouter();

  const car = carsData.find(
    (item) => String(item.id) === String(id)
  );

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [message, setMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  const today = new Date();
  const todayLocal = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (!car) {
    return <main className="p-8">Car not found.</main>;
  }

  function handleCheckAvailability(e) {
    e.preventDefault();

    const result = checkCarAvailability(
      car.id,
      pickupDate,
      returnDate
    );

    setMessage(result.message);
    setIsAvailable(result.available);
  }

  function handleContinue() {
    const result = checkCarAvailability(
      car.id,
      pickupDate,
      returnDate
    );

    setMessage(result.message);
    setIsAvailable(result.available);

    if (!result.available) return;

    const params = new URLSearchParams({
      carId: String(car.id),
      pickupDate,
      returnDate,
    });

    // Change this route if your booking form uses another URL.
    router.push(`/booking?${params.toString()}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        Check Car Availability
      </h1>

      <section className="my-6 rounded-xl border p-5">
        <h2 className="text-xl font-semibold">{car.name}</h2>
        <p className="mt-2">
          ETB {Number(car.price).toLocaleString()} / day
        </p>
      </section>

      <form
        onSubmit={handleCheckAvailability}
        className="space-y-5"
      >
        <div>
          <label htmlFor="pickupDate" className="mb-2 block">
            Pickup date
          </label>
          <input
            id="pickupDate"
            type="date"
            min={todayLocal}
            value={pickupDate}
            onChange={(e) => {
              setPickupDate(e.target.value);
              setIsAvailable(false);
              setMessage("");
            }}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="returnDate" className="mb-2 block">
            Return date
          </label>
          <input
            id="returnDate"
            type="date"
            min={pickupDate || todayLocal}
            value={returnDate}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setIsAvailable(false);
              setMessage("");
            }}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg border p-3 font-semibold"
        >
          Check Availability
        </button>

        {message && (
          <p
            role="status"
            className={
              isAvailable
                ? "text-green-700"
                : "text-red-600"
            }
          >
            {message}
          </p>
        )}

        {isAvailable && (
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-lg bg-red-600 p-3 font-semibold text-white hover:bg-red-700"
          >
            Continue to Booking
          </button>
        )}
      </form>
    </main>
  );
}

export default function AvailabilityPage(){

  return(
    <>
   <Suspense fallback={
    <main className="">
      <p>loading..</p>
    </main>

   }

   >

    <AvailabilityContent />
   </Suspense>
    
    </>
  );
}
