
"use client";

import "./pagination.css";

import { useEffect, useState } from "react";
import useSWR from "swr";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import CarCard from "@/components/cars/car-card";
import carsData from "@/data/cars.json";

import {
  getListedCars,
  initializeCars,
  subscribeToCarChanges,
} from "@/lib/carStorage";

import CarSearch from "@/components/cars/car-search";

// Get a consistent numeric price from different car objects
const getCarPrice = (car) => {
  const rawPrice = car.price ?? car.pricePerDay;

  if (
    rawPrice === undefined ||
    rawPrice === null ||
    rawPrice === ""
  ) {
    return NaN;
  }

  const price = Number(
    String(rawPrice).replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(price) ? price : NaN;
};

const fetcher = () => {
  initializeCars();

  const publishedCars = getListedCars().filter(
    (car) =>
      String(car.status || "").toLowerCase() === "published" ||
      (!car.status && car.isAvailable === true)
  );

  const seedCars = Array.isArray(carsData) ? carsData : [];

  const combinedCars = [
    ...seedCars,
    ...publishedCars.filter(
      (publishedCar) =>
        !seedCars.some(
          (seedCar) =>
            String(seedCar.id) === String(publishedCar.id)
        )
    ),
  ];

  return combinedCars;
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  const carsPerPage = 6;

  const {
    data: cars = [],
    error,
    isLoading,
    mutate,
  } = useSWR("rental_cars", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    return subscribeToCarChanges(() => {
      mutate();
    });
  }, [mutate]);

  // Search, category, and price filtering
  const filteredCars = cars.filter((car) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      String(car.name || "").toLowerCase().includes(query) ||
      String(car.Brand || "").toLowerCase().includes(query) ||
      String(car.Model || "").toLowerCase().includes(query);

    const category = String(
      car.type || car.category || ""
    ).toLowerCase();

    const matchesCategory =
      selectedCategory === "all" ||
      category === selectedCategory;

    const price = getCarPrice(car);

    const matchMinPrice =
      minPrice === "" ||
      (Number.isFinite(price) && price >= Number(minPrice));

    const matchMaxPrice =
      maxPrice === "" ||
      (Number.isFinite(price) && price <= Number(maxPrice));

    return (
      matchesSearch &&
      matchesCategory &&
      matchMinPrice &&
      matchMaxPrice
    );
  });

  // Sort the complete filtered list before pagination
  const sortedCars = filteredCars
    .map((car, originalIndex) => ({
      car,
      originalIndex,
      price: getCarPrice(car),
    }))
    .sort((a, b) => {
      // Cars without valid prices go last
      if (!Number.isFinite(a.price)) return 1;
      if (!Number.isFinite(b.price)) return -1;

      if (sortOrder === "low-high") {
        return (
          a.price - b.price ||
          a.originalIndex - b.originalIndex
        );
      }

      if (sortOrder === "high-low") {
        return (
          b.price - a.price ||
          a.originalIndex - b.originalIndex
        );
      }

      return a.originalIndex - b.originalIndex;
    })
    .map((item) => item.car);

  // Reset to page 1 when filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    minPrice,
    maxPrice,
    sortOrder,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(
    sortedCars.length / carsPerPage
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const indexOfFirstCar =
    (safeCurrentPage - 1) * carsPerPage;

  const indexOfLastCar =
    indexOfFirstCar + carsPerPage;

  // Slice only after sorting the complete list
  const currentCars = sortedCars.slice(
    indexOfFirstCar,
    indexOfLastCar
  );

  if (isLoading) {
    return <p>Loading cars...</p>;
  }

  if (error) {
    return <p>Failed to load cars.</p>;
  }

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
            <button
              type="button"
              className={`category-pill ${
                selectedCategory === "all" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("all")}
            >
              All cars
            </button>

            <button
              type="button"
              className={`category-pill ${
                selectedCategory === "suv" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("suv")}
            >
              SUVs
            </button>

            <button
              type="button"
              className={`category-pill ${
                selectedCategory === "city" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("city")}
            >
              City cars
            </button>

            <button
              type="button"
              className={`category-pill ${
                selectedCategory === "electric" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("electric")}
            >
              Electric
            </button>

            <button
              type="button"
              className={`category-pill ${
                selectedCategory === "luxury" ? "active" : ""
              }`}
              onClick={() => setSelectedCategory("luxury")}
            >
              Luxury car
            </button>
          </div>

          <div>
            <CarSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>

          {/* Price filters and sorting */}
          <div className="car-filter-controls">
            <div className="price-filter">
              <label htmlFor="min-price">
                Minimum price (ETB)
              </label>

              <input
                id="min-price"
                type="number"
                min="0"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="price-filter">
              <label htmlFor="max-price">
                Maximum price (ETB)
              </label>

              <input
                id="max-price"
                type="number"
                min="0"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="sort-filter">
              <label htmlFor="sort-price">
                Sort by price
              </label>

              <select
                id="sort-price"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="low-high">
                  Lowest price first
                </option>
                <option value="high-low">
                  Highest price first
                </option>
              </select>
            </div>
          </div>

          {/* Car catalogue */}
          <div className="featured-grid">
            {currentCars.length > 0 ? (
              currentCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))
            ) : (
              <p className="empty-message">
                No cars are available yet.
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setCurrentPage((page) => page - 1)
                }
                disabled={safeCurrentPage === 1}
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`pagination-button ${
                    safeCurrentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setCurrentPage((page) => page + 1)
                }
                disabled={safeCurrentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
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
