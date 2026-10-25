
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getListedCars,
  deleteListedCar,
} from "@/lib/carStorage";

import { getSession } from "@/lib/sessions";

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
        )
          .trim()
          .toLowerCase(),
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

    // Find the exact car in the shared localStorage collection.
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

    // Prevent owners from publishing another owner's car.
    if (String(targetCar.ownerId) !== String(session.id)) {
      window.alert(
        "You can only publish cars belonging to your account."
      );
      return;
    }

    const approvalStatus = String(
      targetCar.approvalStatus || "pending"
    )
      .trim()
      .toLowerCase();

    console.log("Car ID:", targetCar.id);
    console.log("Approval status:", approvalStatus);
    console.log("Owner ID:", targetCar.ownerId);

    if (approvalStatus !== "approved") {
      window.alert(
        `This car cannot be published yet. ` +
          `Current approval status: ${approvalStatus}.`
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

    // Refresh this page and other components listening for updates.
    loadCars(session.id);
    window.dispatchEvent(new Event("cars-updated"));

    window.alert("Your car has been published successfully!");
  }

  if (!loaded) {
    return (
      <main className="p-8">
        Loading your car listings...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">
            My Listed Cars
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your listings, check approval status, and publish approved cars.
          </p>
        </div>

        <Link
          href="/owner/cars/new"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
        >
          + List Your Car
        </Link>
      </header>

      {cars.length === 0 ? (
        <section className="rounded-xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">
            No cars listed yet
          </h2>

          <p className="my-3 text-gray-600">
            Add your first car to get started.
          </p>

          <Link
            href="/owner/cars/new"
            className="font-semibold text-red-600 hover:underline"
          >
            Create your first listing
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => {
            const approvalStatus = String(
              car.approvalStatus || "pending"
            )
              .trim()
              .toLowerCase();

            const isApproved =
              approvalStatus === "approved";

            const isRejected =
              approvalStatus === "rejected";

            const isPublished = car.isPublished === true;

            return (
              <article
                key={car.id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                {car.image ? (
                  <img
                    src={car.image}
                    alt={car.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-500">
                    No image
                  </div>
                )}

                <div className="p-5">
                  <h2 className="text-lg font-bold">
                    {car.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {car.type} · {car.location}
                  </p>

                  <p className="mt-3 font-semibold">
                    ETB {Number(car.price).toLocaleString()} / day
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {car.description}
                  </p>

                  <div className="mt-4">
                    <p className="text-sm font-semibold">
                      Approval status:{" "}
                      <span
                        className={
                          isApproved
                            ? "text-green-700"
                            : isRejected
                              ? "text-red-600"
                              : "text-amber-600"
                        }
                      >
                        {approvalStatus.charAt(0).toUpperCase() +
                          approvalStatus.slice(1)}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Publication status:{" "}
                      {isPublished ? "Published" : "Not published"}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/owner/cars/${encodeURIComponent(
                        String(car.id)
                      )}/edit`}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 font-medium"
                    >
                      Edit
                    </Link>

                    {!isPublished && (
                      <button
                        type="button"
                        disabled={!isApproved}
                        onClick={() => publishCar(car.id)}
                        className="min-h-11 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
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
                      className="min-h-11 rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
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
