
"use client";

import { Suspense, useEffect, useState } from "react";
import "./carDetails.css";
import carsData from "@/data/cars.json";
import Book_Now_Button from "@/components/bookings/book-now";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getListedCars } from "@/lib/carStorage";

function CarDetailsContent() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedCar = carsData.find(
      (item) => String(item.id) === String(id)
    );

    const ownerCars = getListedCars();

    const ownerCar = ownerCars.find(
      (item) =>
        String(item.id) === String(id) &&
        (item.status === "Published" ||
          (!item.status && item.isAvailable === true))
    );

    setCar(seedCar || ownerCar || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main className="car-details">
        Loading car details...
      </main>
    );
  }

  if (!car) {
    return (
      <main className="car-details">
        <h2>Car not found</h2>
        <Link href="/cars">Browse Cars</Link>
      </main>
    );
  }

  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return (
    <main className="car-details">
      <img
        src={car.image || car.imageUrl || "/images/car-placeholder.jpg"}
        alt={car.name}
      />

      <h3>Name: {car.name}</h3>

      <p>Price: {price.toLocaleString("en-US")} ETB / day</p>
      <p>Brand: {car.brand ?? car.Brand ?? "Not specified"}</p>
      <p>Model: {car.model ?? car.Model ?? "Not specified"}</p>
      <p>Color: {car.color ?? "Not specified"}</p>

      <p>
        Transmission:{" "}
        {car.transmission ?? car.Transmition ?? "Not specified"}
      </p>

      <p>Seats: {car.seats ?? car.Seats ?? "Not specified"}</p>
      <p>Location: {car.location ?? "Not specified"}</p>
      <p>Description: {car.description ?? "No description available"}</p>

      <Book_Now_Button carId={car.id} />

      <Link href="/cars">Browse Cars</Link>
    </main>
  );
}

export default function CarDetails() {
  return (
    <Suspense
      fallback={
        <main className="car-details">
          Loading car details...
        </main>
      }
    >
      <CarDetailsContent />
    </Suspense>
  );
}
