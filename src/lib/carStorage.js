
const CARS_KEY = "rental_cars";

import { getSession } from "@/lib/sessions";

// Get all saved listings, or only listings for one owner.
export function getListedCars(ownerId) {
  if (typeof window === "undefined") return [];

  try {
    const savedCars = JSON.parse(
      localStorage.getItem(CARS_KEY) || "[]"
    );

    if (!Array.isArray(savedCars)) return [];

    if (ownerId === undefined) return savedCars;

    return savedCars.filter(
      (car) => String(car.ownerId) === String(ownerId)
    );
  } catch {
    return [];
  }
}

export function saveListedCars(cars) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CARS_KEY, JSON.stringify(cars));
}

// Add a listing for the currently signed-in owner.
export function addListedCar(car) {
  const session = getSession();

  if (!session || session.role !== "owner") {
    return getListedCars();
  }

  const cars = getListedCars();

  const newCar = {
    ...car,
    ownerId: session.id,
    status: "published"
  };

  const updatedCars = [...cars, newCar];

  saveListedCars(updatedCars);

  return updatedCars;
}

// Update only the current owner's listing.
export function updateListedCar(updatedCar) {
  const session = getSession();

  if (!session || session.role !== "owner") {
    return getListedCars();
  }

  const cars = getListedCars();

  const updatedCars = cars.map((car) =>
    String(car.id) === String(updatedCar.id) &&
    String(car.ownerId) === String(session.id)
      ? { ...updatedCar, ownerId: session.id }
      : car
  );

  saveListedCars(updatedCars);

  return updatedCars;
}

// Delete only the current owner's listing.
export function deleteListedCar(id) {
  const session = getSession();

  if (!session || session.role !== "owner") {
    return getListedCars();
  }

  const cars = getListedCars();

  const updatedCars = cars.filter(
    (car) =>
      !(
        String(car.id) === String(id) &&
        String(car.ownerId) === String(session.id)
      )
  );

  saveListedCars(updatedCars);

  return updatedCars;
}
