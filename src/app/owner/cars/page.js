
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getListedCars,
  deleteListedCar,
} from "@/lib/carStorage";

import { getSession } from "@/lib/sessions";

export default function OwnerCarsPage() {
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const loadCars = useCallback((ownerId) => {
    setCars(getListedCars(ownerId));
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
  }, [router, loadCars]);

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car listing?"
    );

    if (!confirmed) return;

    deleteListedCar(id);

    const session = getSession();

    if (session?.role === "owner") {
      loadCars(session.id);
    }
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
            Manage the vehicles you have listed for rent.
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
          {cars.map((car) => (
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

                <div className="mt-5">


                  <Link href={`/owner/cars/${encodeURIComponent(String(car.id))}/edit`}>

                  Edit
                  
                  </Link>
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
          ))}
        </section>
      )}
    </main>
  );
}
