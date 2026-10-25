
"use client";

import "./car_L_f.css";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addListedCar } from "@/lib/carStorage";
import { isSignedIn } from "@/lib/sessions";

export default function CarListingForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    type: "Sedan",
    price: "",
    location: "",
    image: "",
    description: "",
  });

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

    const car = {
      ...form,
      id: `owner-${Date.now()}`,
      price,

      // Owner information
      ownerId: "demo-owner",

      // Admin must approve before publication
      approvalStatus: "pending",
      isPublished: false,

      // Availability is separate from approval
      isAvailable: true,

      createdAt: new Date().toISOString(),
    };

    addListedCar(car);

    router.push("/owner/cars");
  }

  return (
    <main className="car-listing-page">
      <section className="car-listing-card">
        <h1>List Your Car</h1>

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
              placeholder="Toyota Corolla 2022"
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
              step="any"
              value={form.price}
              onChange={handleChange}
              placeholder="2500"
              required
            />
          </div>

          <div className="listing-field">
            <label htmlFor="location">Pickup location</label>
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
            <label htmlFor="image">Car image path or URL</label>
            <input
              id="image"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="/images/toyota-corolla.jpg"
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
              placeholder="Describe your car..."
              rows={4}
              required
            />
          </div>

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
