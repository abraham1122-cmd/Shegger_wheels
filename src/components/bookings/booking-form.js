
"use client";

import { useState } from "react";
import Link from "next/link";
import "./booking_form.css";

import { checkCarAvailability } from "@/lib/availability";

export default function BookingForm({ car }) {
  const [pickUpDate, setPickUpDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [location, setLocation] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  const today = new Date();
  const todayLocal = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  if (!car) {
    return (
      <p className="booking-error">
        Car details are unavailable.
      </p>
    );
  }

  function handleCheckAvailability() {
    setIsAvailable(false);

    const result = checkCarAvailability(
      car.id,
      pickUpDate,
      returnDate
    );

    setMessage(result.message);
    setIsAvailable(result.available);

    return result.available;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (returnDate <= pickUpDate) {
      setMessage("Return date must be after the pickup date.");
      setIsAvailable(false);
      return;
    }

    const result = checkCarAvailability(
      car.id,
      pickUpDate,
      returnDate
    );

    setMessage(result.message);
    setIsAvailable(result.available);

    if (!result.available) return;

    const booking = {
      carId: car.id,
      carName: car.name,
      pricePerDay: Number(car.pricePerDay ?? car.price),
      pickUpDate,
      returnDate,
      location,
      fullName,
      email,
      phone,
    };

    sessionStorage.setItem(
      "Booking_pending",
      JSON.stringify(booking)
    );

    window.location.href = "/payment";
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form-card">
      <div className="booking-form-header">
        <span className="booking-eyebrow">
          RESERVE YOUR RIDE
        </span>
        <h2 id="h2">Book your car now!</h2>
      </div>

      <div className="booking-car-summary">
        <div>
          <span className="booking-summary-label">
            Selected vehicle
          </span>
          <h3>{car.name}</h3>
        </div>

        <div className="booking-price">
          <strong>
            ETB {car.pricePerDay ?? car.price}
          </strong>
          <span> per day</span>
        </div>
      </div>

      <div className="booking-form-fields">
        <div className="booking-field">
          <label htmlFor="pickup">Pickup date</label>
          <input
            type="date"
            id="pickup"
            value={pickUpDate}
            min={todayLocal}
            onChange={(e) => {
              setPickUpDate(e.target.value);
              setIsAvailable(false);
              setMessage("");
            }}
            required
          />
        </div>

        <div className="booking-field">
          <label htmlFor="return">Return date</label>
          <input
            type="date"
            id="return"
            value={returnDate}
            min={pickUpDate || todayLocal}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setIsAvailable(false);
              setMessage("");
            }}
            required
          />
        </div>

        <div className="booking-field full-width">
          <label htmlFor="location">Pickup location</label>
          <input
            type="text"
            id="location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="booking-field full-width">
          <label htmlFor="name">Full name</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your full name"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="booking-field">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="xxxx@gmail.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="booking-field">
          <label htmlFor="tel">Phone number</label>
          <input
            type="tel"
            id="tel"
            placeholder="Enter phone number"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheckAvailability}
        className="booking-submit-button"
      >
        Check Availability
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className={
            isAvailable ? "availability-success" : "booking-error"
          }
        >
          {message}
        </p>
      )}

      {isAvailable && (
        <button
          type="submit"
          className="booking-submit-button"
        >
          Pay-Now
        </button>
      )}

      <Link href="/cars">Back to Cars</Link>
    </form>
  );
}
