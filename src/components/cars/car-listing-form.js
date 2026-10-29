
"use client";

import "./car_L_f.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addListedCar } from "@/lib/carStorage";
import { isSignedIn } from "@/lib/sessions";
import LocationPickerWrapper from "../maps/location-picker-wrapper";

export default function CarListingForm() {
  const router = useRouter();

  const [carLocation, setCarLocation] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "Sedan",
    price: "",
    location: "",
    image: "",
    description: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // If the pickup address is edited manually,
    // require the user to select a matching map location again.
    if (name === "location") {
      setCarLocation(null);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!isSignedIn()) {
      router.push(
        `/signin?next=${encodeURIComponent("/owner/cars/new")}`
      );
      return;
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price per day.");
      return;
    }

    if (!form.location.trim()) {
      setError("Enter a pickup address.");
      return;
    }

    if (
      !carLocation ||
      !Number.isFinite(Number(carLocation.latitude)) ||
      !Number.isFinite(Number(carLocation.longitude))
    ) {
      setError(
        "Please search for a location and select a result or map point."
      );
      return;
    }

    const car = {
      ...form,
      name: form.name.trim(),
      location: carLocation.name || form.location.trim(),
      id: `owner-${Date.now()}`,
      price,
      ownerId: "demo-owner",
      approvalStatus: "pending",
      isPublished: false,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      latitude: Number(carLocation.latitude),
      longitude: Number(carLocation.longitude),
    };

    try {
      addListedCar(car);
      router.push("/owner/cars");
    } catch (err) {
      console.error("Failed to save car listing:", err);
      setError("Unable to save your car listing. Please try again.");
    }
  }

  function handleLocationSelect(location) {
    setCarLocation(location);
    setError("");

    setForm((previous) => ({
      ...previous,
      location: location.name,
    }));
  }

  return (
    <main className="car-listing-page">
      <section className="car-listing-card">
        <h1>Add Your Car</h1>

        <p>
          Submit your vehicle for admin review.
          You can publish it after approval.
        </p>

        <form onSubmit={handleSubmit} className="car-listing-form">
          <div className="listing-field">
            <label htmlFor="name">Car name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g Rangerover.."
              required
            />
          </div>

           <div className="listing-field">
            <label htmlFor="brand">Car Brand</label>
            <input
              id="brand"
              name="name"
              value={form.brand}
              onChange={handleChange}
              placeholder="write your car brand"
              required
            />
          </div>

           <div className="listing-field">
            <label htmlFor="model">Car Model</label>
            <input
              id="model"
              name="name"
              value={form.model}
              onChange={handleChange}
              placeholder="Your Car Model"
              required
            />
          </div>

           <div className="listing-field">
            <label htmlFor="transmission">Car Transmission</label>
            <input
              id="transmission"
              name="name"
              value={form.transmission}
              onChange={handleChange}
              placeholder="Transmission.."
              required
            />
          </div>

           <div className="listing-field">
            <label htmlFor="seat">Car seats</label>
            <input
              id="seat"
              name="name"
              value={form.seat}
              onChange={handleChange}
              placeholder="Car seats.. e.g 4 "
              required
            />
          </div>

          <div className="listing-field">
            <label htmlFor="type">Car type</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Van">Van</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="listing-field">
            <label htmlFor="price">Price per day (ETB)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="1"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price per day"
              required
            />
          </div>

          <div className="listing-field">
            <label htmlFor="location">Pickup address or area</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Bole, Addis Ababa"
              required
            />
          
          </div>

          <div className="listing-field">
            <label htmlFor="image"> image path or URL</label>
            <input
              id="image"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="/images/corolla.jpg"
              required
            />
          </div>

          <div className="listing-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your car and its features..."
              rows={4}
              required
            />
          </div>

          <section className="form-section">
            <h2>Car Location</h2>

            {/* <p>
              Search for the parking or pickup address and select a result
              to save its coordinates.
            </p> */}

            <LocationPickerWrapper
              value={carLocation}
              onChange={handleLocationSelect}
            />

            <input
              type="hidden"
              name="latitude"
              value={carLocation?.latitude ?? ""}
              readOnly
            />

            <input
              type="hidden"
              name="longitude"
              value={carLocation?.longitude ?? ""}
              readOnly
            />
          </section>

          {error && (
            <p className="listing-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="listing-submit">
            Submit for Approval
          </button>
        </form>
      </section>
    </main>
  );
}
