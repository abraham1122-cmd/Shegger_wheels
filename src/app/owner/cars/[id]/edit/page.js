
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getListedCars, updateListedCar } from "@/lib/carStorage";
import { getSession } from "@/lib/sessions";

import "@/app/owner/cars/owner-car.css"

function EditCarContent() {
  const { id } = useParams();
  const router = useRouter();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "owner") {
      router.replace("/signin");
      return;
    }

    const ownerCars = getListedCars(session.id) || [];
    const existingCar = ownerCars.find(
      (item) => String(item.id) === String(id)
    );

    setCar(existingCar || null);
    setLoading(false);
  }, [id, router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setCar((current) => ({ ...current, [name]: value }));
  }





  function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (!car.name?.trim() || !car.location?.trim()) {
    setError("Please enter the car name and location.");
    return;
  }

  const price = Number(car.price);

  if (!Number.isFinite(price) || price <= 0) {
    setError("Please enter a valid daily rental price.");
    return;
  }

  try {
    setSaving(true);

    updateListedCar({
      ...car,
      name: car.name.trim(),
      location: car.location.trim(),
      price,
    });

    router.push("/owner/cars");
  } catch (err) {
    console.error("Failed to update car:", err);
    setError("Unable to save your changes. Please try again.");
    setSaving(false);
  }
}






  if (loading) return <p>Loading car details...</p>;

  if (!car) {
    return (
      <section className="owner-edit-page">
        <h1>Car not found</h1>
        <p>This car may have been removed or may not belong to you.</p>
        <Link href="/owner/cars">Back to My Cars</Link>
      </section>
    );
  }


  return (
    <section className="owner-edit-page">
      <div className="owner-edit-heading">
        <div>
          <h3 id="ec">You can update your vehicle information</h3>
         
        </div>
        <Link href="/owner/cars" className="owner-edit-cancel">
          Cancel
        </Link>
      </div>

      <form className="owner-edit-form" onSubmit={handleSubmit}>
        <div className="owner-edit-field">
          <label htmlFor="name">Car Name</label>
          <input id="name" name="name" value={car.name || ""}
            onChange={handleChange} required />
        </div>

         <div className="owner-edit-field">
          <label htmlFor="brand">Brand</label>
          <input id="brand" 
             name="brand"
            value={car.brand || ""} onChange={handleChange} 
            placeholder="type car brand"
            
            required />
        </div>

        <div className="owner-edit-field">
          <label htmlFor="model">Model</label>
          <input id="model" 
             name="model"
            value={car.model || ""} onChange={handleChange} 
            placeholder="type your car model"
            
            required />
        </div>


        <div className="owner-edit-field">
          <label htmlFor="seat">Seats</label>
          <input id="seat" 
             name="seat"
            value={car.seat || ""} onChange={handleChange} 
            placeholder="type your car seat e.g 4"
            
            required />
        </div>

        <div className="owner-edit-field">
          <label htmlFor="transmission">Transmission</label>
          <input id="transmission" 
             name="transmission"
            value={car.transmission || ""} onChange={handleChange} 
            placeholder="type your car transmission"
            
            required />
        </div>

        <div className="owner-edit-field">
          <label htmlFor="type">Car Type</label>
          <input id="type" name="type" value={car.type || ""}
            onChange={handleChange} placeholder="e.g. Sedan, SUV" />
        </div>

        <div className="owner-edit-field">
          <label htmlFor="price">Price Per Day (ETB)</label>
          <input id="price" name="price" type="number" min="1"
            step="0.01" value={car.price ?? "enter price p/day"}
            onChange={handleChange} required />
        </div>

        <div className="owner-edit-field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location"
            value={car.location || ""} onChange={handleChange} required />
        </div>

        <div className="owner-edit-field owner-edit-full">
          <label htmlFor="image">Image URL</label>
          <input id="image" name="image" type="text"
            value={car.image || ""} onChange={handleChange}
            placeholder="image URL" />
        </div>

        <div className="owner-edit-field owner-edit-full">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="5"
            value={car.description || ""} onChange={handleChange}
            placeholder="Describe your car..." />
        </div>

        {error && <p className="owner-edit-error" role="alert">{error}</p>}

        <div className="owner-edit-actions">
          <Link href="/owner/cars" className="owner-edit-cancel">
            Cancel
          </Link>
          <button type="submit" disabled={saving}>
            {saving ? "saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function EditCarPage() {
  return (
    <Suspense fallback={<p>Loading edit page...</p>}>
      <EditCarContent />
    </Suspense>
  );
}
