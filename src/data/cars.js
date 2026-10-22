
"use client";

import { useEffect } from "react";
import carsData from "@/data/cars.json";

export default function SaveCars() {
  useEffect(() => {
    try {
      console.log("SaveCars component is running");
      console.log("Imported cars:", carsData);

      localStorage.setItem(
        "rental_cars",
        JSON.stringify(carsData)
      );

      console.log(
        "Saved data:",
        localStorage.getItem("rental_cars")
      );
    } catch (error) {
      console.error("Could not save cars:", error);
    }
  }, []);

  return <p>Car Data Loaded</p>;
}
