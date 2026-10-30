
"use client";

import { Suspense, useEffect, useState } from "react";
import "./carDetails.css";

import carsData from "@/data/cars.json";
import Book_Now_Button from "@/components/bookings/book-now";
import CarReviews from "@/components/reviews/car-review";
import CarDetailMapWrapper from "@/components/maps/car-details-map-wrapper";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getListedCars } from "@/lib/carStorage";


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
        <p>Loading car details...</p>
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

        <Link href="/cars" className="browse-cars-link">
          Browse Cars
        </Link>
      </main>
    );
  }


  const price = Number(car.pricePerDay ?? car.price ?? 0);


  return (
    <main className="car-details">

      {/* LEFT COLUMN */}
      <section className="car-details-left">

        {/* Car image */}
        <div className="car-image-container">
          <Image
            src={getValidImagePath(car)}
            alt={car.name || car.title || "Rental car"}
            width={1200}
            height={800}
            sizes="(max-width: 600px) 100vw, 50vw"
            priority
          />
        </div>


        {/* Description */}
        <div className="car-description">
          <h3>Description</h3>

          <p>
            {car.description || "No description available."}
          </p>
        </div>


        {/* Pickup location */}
        <section className="car-location-section">

          <h3>Pickup Location</h3>

          <p>
            {car.location || "Pickup location"}
          </p>

          <div className="car-map-container">
            <CarDetailMapWrapper
              latitude={car.latitude}
              longitude={car.longitude}
              locationName={car.location || "Car pickup location"}
            />
          </div>

        </section>

      </section>


      {/* RIGHT COLUMN */}
      <section className="car-details-right">

        {/* Car heading */}
        <div className="car-heading">

          <h1>
            {car.name || car.title || "Rental car"}
          </h1>

          <p className="car-price">
            {Number.isFinite(price)
              ? price.toLocaleString("en-US")
              : "N/A"} ETB / day
          </p>

        </div>


        {/* Specifications */}
        <div className="car-specifications">

          <h3>Car Specifications</h3>

          <div className="specification-row">
            <span>Brand</span>
            <strong>{car.brand ?? car.Brand ?? "Not specified"}</strong>
          </div>

          <div className="specification-row">
            <span>Model</span>
            <strong>{car.model ?? car.Model ?? "Not specified"}</strong>
          </div>

          <div className="specification-row">
            <span>Color</span>
            <strong>{car.color ?? "Not specified"}</strong>
          </div>

          <div className="specification-row">
            <span>Transmission</span>
            <strong>
              {car.transmission ?? car.Transmition ?? "Not specified"}
            </strong>
          </div>

          <div className="specification-row">
            <span>Seats</span>
            <strong>{car.seats ?? car.Seats ?? "Not specified"}</strong>
          </div>

        </div>


        {/* Book Now */}
        <div className="car-booking-container">

          {car.isAvailable === false ? (
            <p className="unavailable-message">
              This car is currently unavailable for booking.
            </p>
          ) : (
            <Book_Now_Button carId={car.id} />
          )}

        </div>


        {/* Customer reviews - below Book Now */}
        <section className="car-reviews-section">

          <CarReviews carId={car.id} />

        </section>

      </section>


      {/* BACK TO CARS */}
      <Link href="/cars" className="browse-cars-link">
        Browse Cars
      </Link>

    </main>
  );
}


export default function CarDetails() {
  return (
    <Suspense
      fallback={
        <main className="car-details">
          <p>Loading car details...</p>
        </main>
      }
    >
      <CarDetailsContent />
    </Suspense>
  );
}
