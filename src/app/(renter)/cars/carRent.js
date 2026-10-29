

"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CarCard from "@/components/cars/car-card";
import carsData from "@/data/cars.json";
import { getListedCars } from "@/lib/carStorage";

import CarSearch from "@/components/cars/car-search";





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

export default function CarsPageContent() {
  const [cars, setCars] = useState(
    Array.isArray(carsData) ? carsData : []
  );

  const [ searchQuery, setSearchQuery ] = useState("");

  useEffect(() => {

const publishedCars = getListedCars().filter(
  (car) =>
    String(car.status || "").toLowerCase() === "published" ||
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

  const filteredCars = cars.filter((car)=>{

    const query = searchQuery.trim().toLowerCase();

    return(
      car.name?.toLowerCase().includes(query) ||
      car.Brand?.toLowerCase().includes(query) ||
      car.Model?.toLowerCase().includes(query)

    )

    
  })

  return (
    <>
      <Navbar />

      <main>
        <section className="section container">
          <div className="section-heading heading-with-link">
            <div>
              <span className="eyebrow">
             
                 Find a car that makes the journey yours.
              </span>

            
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

          <div className="">

          <CarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              />

              </div>

          {/* Car catalogue */}
          <div className="featured-grid">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
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