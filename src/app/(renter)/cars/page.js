"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CarCard from "@/components/cars/car-card";
import carsData from "@/data/cars.json";
import { getListedCars } from "@/lib/carStorage";

const steps = [
  {
    number: "01",
    title: "Find your wheels",
    description:
      "Explore cars near you and choose the one that fits your plans.",
  },
  {
    number: "02",
    title: "Meet your host",
    description:
      "Send a booking request and confirm the details with the owner.",
  },
  {
    number: "03",
    title: "Hit the road",
    description:
      "Pick up your car and enjoy the freedom to go your own way.",
  },
];

export default function CarsPage() {
  const [cars, setCars] = useState(
    Array.isArray(carsData) ? carsData : []
  );

  useEffect(() => {
    const publishedCars = getListedCars().filter(
      (car) => car.status === "Published" ||

       (!car.status && car.isAvailable === true)
    );

    const combinedCars = [
      ...(Array.isArray(carsData) ? carsData : []),
      ...publishedCars.filter(
        (publishedCar) =>
          !(Array.isArray(carsData) ? carsData : []).some(
            (seedCar) =>
              String(seedCar.id) === String(publishedCar.id)
          )
      ),
    ];

    setCars(combinedCars);
  }, []);

  return (
    <>
      <Navbar />

      <main>
        <section className="section container">
          <div className="section-heading heading-with-link">
            <div>
              <span className="eyebrow">
                YOUR NEXT RIDE IS HERE
              </span>

              <h2>Find your kind of freedom.</h2>

              <p>
                From weekday errands to weekend escapes, find a car
                that makes the journey yours.
              </p>
            </div>

            <a href="/cars" className="text-link">
              Explore all cars ↗
            </a>
          </div>

          <div className="category-pills">
            <a className="category-pill active" href="/cars">
              All cars
            </a>

            <a className="category-pill" href="/cars?type=suv">
              SUVs
            </a>

            <a className="category-pill" href="/cars?type=city">
              City cars
            </a>

            <a
              className="category-pill"
              href="/cars?type=electric"
            >
              Electric
            </a>
          </div>

          {/* Car catalogue */}
          <div className="featured-grid">
            {cars.length > 0 ? (
              cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))
            ) : (
              <p className="empty-message">
                No cars are available yet.
              </p>
            )}
          </div>
        </section>

        <section
          id="how-it-works"
          className="section container"
        >
          <div className="section-heading">
            <span className="eyebrow">
              A LITTLE MORE SIMPLE
            </span>

            <h2>Your next trip requires three simple steps.</h2>

            <p>
              Less planning stress. More time for the good stuff.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article
                className="step-card"
                key={step.number}
              >
                <span className="step-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}