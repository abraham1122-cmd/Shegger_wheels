"use client";

import { Suspense, useEffect, useState } from "react";
import "./carDetails.css";
import carsData from "@/data/cars.json";
import Book_Now_Button from "@/components/bookings/book-now";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getListedCars } from "@/lib/carStorage";
import CarReviews from "@/components/reviews/car-review";
import CarDetailMapWrapper from "@/components/maps/car-details-map-wrapper";
import Image from "next/image";

function isPublishedOrAvailable(car) {
  const status = String(car.status || "").toLowerCase();

  return (
    status === "published" ||
    (!car.status && car.isAvailable === true)
  );
}


function getValidImagePath(car) {
  const image = car.image || car.imageUrl;

  if (typeof image !== "string" || !image.trim()) {
    return "/images/car-placeholder.jpg";
  }

  if (image.startsWith("../images/")) {
    return image.replace("../images/", "/images/");
  }

  if (image.startsWith("images/")) {
    return `/${image}`;
  }

  return image;
}

function findCarById(id) {
  const seedCars = Array.isArray(carsData) ? carsData : [];
  const ownerCars = getListedCars();

  const ownerCar = ownerCars.find(
    (item) =>
      item.id != null &&
      String(item.id) === String(id) &&
      isPublishedOrAvailable(item)
  );

  const seedCar = seedCars.find(
    (item) =>
      item.id != null &&
      String(item.id) === String(id)
  );

  return ownerCar || seedCar || null;
}

function CarDetailsContent() {
  const params = useParams();
  const id = params?.id;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    try {
      setCar(findCarById(id));
    } catch (error) {
      console.error("Unable to load car details:", error);
      setCar(null);
    } finally {
      setLoading(false);
    }
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
        <p>
          This car may have been removed or is no longer published.
        </p>
        <Link href="/cars">Browse Cars</Link>
      </main>
    );
  }

  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return (
    <main className="car-details">

      <Image
        src={getValidImagePath(car)}
        alt={car.name || car.title || "Rental car"}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 80vw"
        style={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
        }}
      />

      <h3>Name: {car.name || car.title || "Rental car"}</h3>

      <p>
        Price:{" "}
        {Number.isFinite(price)
          ? price.toLocaleString("en-US")
          : "N/A"}
        {" "}ETB / day
      </p>

      <p>Brand: {car.brand ?? car.Brand ?? "Not specified"}</p>

      <p>Model: {car.model ?? car.Model ?? "Not specified"}</p>

      <p>Color: {car.color ?? "Not specified"}</p>

      <p>
        Transmission:{" "}
        {car.transmission ?? car.Transmition ?? "Not specified"}
      </p>

      <p>Seats: {car.seats ?? car.Seats ?? "Not specified"}</p>

      <p>
        Description: {car.description ?? "No description available"}
      </p>

      {car.isAvailable === false ? (
        <p>This car is currently unavailable for booking.</p>
      ) : (
        <Book_Now_Button carId={car.id} />
      )}

      <section className="car-location-section">

        <p>
          {car.location || "Pickup location"}
        </p>

        <CarDetailMapWrapper
          latitude={car.latitude}
          longitude={car.longitude}
          locationName={car.location || "Car pickup location"}
        />

      </section>

      <CarReviews carId={car.id} />

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