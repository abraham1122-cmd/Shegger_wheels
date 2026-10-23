
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/bookings/booking-form";
import carsData from "@/data/cars.json";
import { getListedCars } from "@/lib/carStorage";
import Link from "next/link";

function CheckOutContent() {
  const searchParams = useSearchParams();
  const carId = searchParams.get("carId");

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carId) {
      setCar(null);
      setLoading(false);
      return;
    }

    const seedCar = carsData.find(
      (item) => String(item.id) === String(carId)
    );

    const ownerCar = getListedCars().find(
      (item) =>
        String(item.id) === String(carId) &&
        (item.status === "Published" ||
          (!item.status && item.isAvailable === true))
    );

    setCar(seedCar || ownerCar || null);
    setLoading(false);
  }, [carId]);

  if (loading) {
    return <p>Loading checkout...</p>;
  }

  if (!car) {
    return (
      <main>
        <h2>Car not found</h2>
        <p>
          This car may have been removed or is no longer available.
        </p>
        <Link href="/cars">Browse Cars</Link>
      </main>
    );
  }

  return <BookingForm car={car} />;
}

export default function CheckOutPage() {
  return (
    <Suspense fallback={<p>Loading checkout...</p>}>
      <CheckOutContent />
    </Suspense>
  );
}
