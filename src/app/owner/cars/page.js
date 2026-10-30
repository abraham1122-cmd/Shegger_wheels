
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getListedCars,
  deleteListedCar,
} from "@/lib/carStorage";

import { getSession } from "@/lib/sessions";

import "./owner-car.css";

const CARS_STORAGE_KEY = "rental_cars";

function readAllCars() {
  try {
    const stored = localStorage.getItem(CARS_STORAGE_KEY);
    const cars = stored ? JSON.parse(stored) : [];

    return Array.isArray(cars) ? cars : [];
  } catch (error) {
    console.error("Could not read car listings:", error);
    return [];
  }
}

export default function OwnerCarsPage() {
  const router = useRouter();

  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadCars = useCallback((ownerId) => {
    const ownerCars = getListedCars(ownerId);

    setCars(
      ownerCars.map((car) => ({
        ...car,
        approvalStatus: String(
          car.approvalStatus || "pending"
        ).trim().toLowerCase(),
        isPublished: car.isPublished === true,
      }))
    );

    setLoaded(true);
  }, []);

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.replace(
        `/signin?next=${encodeURIComponent("/owner/cars")}`
      );
      return;
    }

    if (session.role !== "owner") {
      router.replace("/cars");
      return;
    }

    loadCars(session.id);

    function refreshCars() {
      const currentSession = getSession();

      if (currentSession?.role === "owner") {
        loadCars(currentSession.id);
      }
    }

    window.addEventListener("cars-updated", refreshCars);
    window.addEventListener("storage", refreshCars);

    return () => {
      window.removeEventListener("cars-updated", refreshCars);
      window.removeEventListener("storage", refreshCars);
    };
  }, [router, loadCars]);

  function handleDelete(carId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car listing?"
    );

    if (!confirmed) return;

    deleteListedCar(carId);

    window.dispatchEvent(new Event("cars-updated"));

    const session = getSession();

    if (session?.role === "owner") {
      loadCars(session.id);
    }
  }

  function publishCar(carId) {
    const session = getSession();

    if (!session || session.role !== "owner") {
      window.alert("Please sign in with your owner account.");

      router.push(
        `/signin?next=${encodeURIComponent("/owner/cars")}`
      );
      return;
    }

    const allCars = readAllCars();

    const targetCar = allCars.find(
      (car) => String(car.id) === String(carId)
    );

    if (!targetCar) {
      window.alert(
        "This car was not found in rental_cars. " +
        "Check src/lib/carStorage.js to ensure it uses the same storage key."
      );
      return;
    }

    if (String(targetCar.ownerId) !== String(session.id)) {
      window.alert(
        "You can only publish cars belonging to your account."
      );
      return;
    }

    const approvalStatus = String(
      targetCar.approvalStatus || "pending"
    ).trim().toLowerCase();

    if (approvalStatus !== "approved") {
      window.alert(
        `This car cannot be published yet. Current approval status: ${approvalStatus}.`
      );
      return;
    }

    if (targetCar.isPublished === true) {
      window.alert("This car is already published.");
      return;
    }

    const updatedCars = allCars.map((car) =>
      String(car.id) === String(carId)
        ? { ...car, isPublished: true }
        : car
    );

    try {
      localStorage.setItem(
        CARS_STORAGE_KEY,
        JSON.stringify(updatedCars)
      );
    } catch (error) {
      console.error("Could not save published car:", error);
      window.alert("Unable to publish the car. Please try again.");
      return;
    }

    loadCars(session.id);

    window.dispatchEvent(new Event("cars-updated"));

    window.alert("Your car has been published successfully!");
  }

  if (!loaded) {
    return (
      <main className="owner-cars-loading">
        Loading...
      </main>
    );
  }

  return (
    <main className="owner-cars-page">

      <header className="owner-cars-header">
        <div className="owner-cars-heading">
          <h2 id="mlc">My Listed Cars</h2>

          <p id="pmlc">
            Manage your listings, check approval status,
            and publish approved cars.
          </p>
        </div>

        <Link
          href="/owner/cars/new"
          className="add-car-button"
        >
          + List Your Car
        </Link>
      </header>

      {cars.length === 0 ? (
        <section className="empty-cars-state">
          <h2>No cars listed yet</h2>

          <p>
            Add your first car to get started.
          </p>

          <Link
            href="/owner/cars/new"
            className="create-first-listing"
          >
            Create your first listing
          </Link>
        </section>
      ) : (
        <section className="owner-cars-grid">

          {cars.map((car) => {
            const approvalStatus = String(
              car.approvalStatus || "pending"
            ).trim().toLowerCase();

            const isApproved = approvalStatus === "approved";
            const isRejected = approvalStatus === "rejected";
            const isPublished = car.isPublished === true;

            return (
              <article
                key={car.id}
                className="owner-car-card"
              >

                {car.image ? (
                  <img
                    src={car.image}
                    alt={car.name || "Car listing"}
                    className="owner-car-image"
                  />
                ) : (
                  <div className="owner-car-no-image">
                    No image
                  </div>
                )}

                <div className="owner-car-content">

                  <h2>{car.name}</h2>

                  <p className="owner-car-meta">
                    {car.type} · {car.location}
                  </p>

                  <p className="owner-car-price">
                    ETB {Number(car.price || 0).toLocaleString("en-US")} / day
                  </p>

                  <p className="owner-car-description">
                    {car.description}
                  </p>

                  <div className="owner-car-status">

                    <p>
                      Approval status:{" "}
                      <span
                        className={
                          isApproved
                            ? "approval-approved"
                            : isRejected
                              ? "approval-rejected"
                              : "approval-pending"
                        }
                      >
                        {approvalStatus.charAt(0).toUpperCase() +
                          approvalStatus.slice(1)}
                      </span>
                    </p>

                    <p>
                      Publication status:{" "}
                      <span
                        className={
                          isPublished
                            ? "publication-published"
                            : "publication-unpublished"
                        }
                      >
                        {isPublished ? "Published" : "Not published"}
                      </span>
                    </p>

                  </div>

                  <div className="owner-car-actions">

                    <Link
                      href={`/owner/cars/${encodeURIComponent(
                        String(car.id)
                      )}/edit`}
                      className="edit-car-button"
                    >
                      Edit
                    </Link>

                    {!isPublished && (
                      <button
                        type="button"
                        disabled={!isApproved}
                        onClick={() => publishCar(car.id)}
                        className="publish-car-button"
                      >
                        {isRejected
                          ? "Car Rejected"
                          : isApproved
                            ? "Publish Car"
                            : "Waiting for Approval"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(car.id)}
                      className="delete-car-button"
                    >
                      Delete Listing
                    </button>

                  </div>

                </div>
              </article>
            );
          })}

        </section>
      )}

    </main>
  );
}
