
import carsData from "@/data/cars.json";
import { getSession } from "@/lib/sessions";

const CARS_KEY = "rental_cars";
const CARS_EVENT = "rental-cars-updated";


export function initializeCars() {
  if (typeof window === "undefined") return [];

  try {
    const existingCars = localStorage.getItem(CARS_KEY);

    
    if (existingCars === null) {
      const initialCars = Array.isArray(carsData)
        ? carsData
        : [];

      localStorage.setItem(
        CARS_KEY,
        JSON.stringify(initialCars)
      );

      return initialCars;
    }

    const parsedCars = JSON.parse(existingCars);

    return Array.isArray(parsedCars) ? parsedCars : [];
  } catch (error) {
    console.error("Failed to initialize cars:", error);
    return [];
  }
}

function notifyCarsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CARS_EVENT));
  }
}


export function getListedCars(ownerId) {
  if (typeof window === "undefined") return [];

  try {
    const savedCars = initializeCars();

    if (ownerId === undefined) return savedCars;

    return savedCars.filter(
      (car) => String(car.ownerId) === String(ownerId)
    );
  } catch (error) {
    console.error("Failed to retrieve cars:", error);
    return [];
  }
}


export function saveListedCars(cars) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      CARS_KEY,
      JSON.stringify(cars)
    );

    notifyCarsChanged();
  } catch (error) {
    console.error("Failed to save cars:", error);
  }
}


export function addListedCar(car) {
  const session = getSession();

  if (!session || session.role !== "owner") {
    return getListedCars();
  }

  const cars = getListedCars();

  const newCar = {
    ...car,
    ownerId: session.id,
    status: "published",
  };

  const updatedCars = [...cars, newCar];

  saveListedCars(updatedCars);

  return updatedCars;
}


export function updateListedCar(updatedCar) {
  const session = getSession();

  if (!session || session.role !== "owner") {
    return getListedCars();
  }

  const cars = getListedCars();

  const updatedCars = cars.map((car) =>
    String(car.id) === String(updatedCar.id) &&
    String(car.ownerId) === String(session.id)
      ? {
          ...updatedCar,
          ownerId: session.id,
        }
      : car
  );

  saveListedCars(updatedCars);

  return updatedCars;
}


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



export function subscribeToCarChanges(callback) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => callback();

  const handleStorageChange = (event) => {
    if (event.key === CARS_KEY) {
      callback();
    }
  };

  window.addEventListener(CARS_EVENT, handleChange);
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(CARS_EVENT, handleChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}

