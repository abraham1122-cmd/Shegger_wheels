"use client";

import { useState } from "react";
import "./booking_form.css";

import Link from "next/link";

export default function BookingForm({ car }) {
  const [pickUpDate, setPickUpDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const booking = {
      carId: car.id,
      carName: car.name,
      pricePerDay: car.price,
      pickUpDate,
      returnDate,
      location,
    };

    sessionStorage.setItem(
      "Booking_pending",
      JSON.stringify(booking)
    );

    window.location.href = "/payment";
  }

  if (!car) {
    return <p className="booking-error">Car details are unavailable.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form-card">
      <div className="booking-form-header">
        <span className="booking-eyebrow">RESERVE YOUR RIDE</span>
        <h2 id="h2">Book your car now!</h2>
        
      </div>

      <div className="booking-car-summary">
        <div>
          <span className="booking-summary-label">Selected vehicle</span>
          <h3>{car.name}</h3>
        </div>

        <div className="booking-price">
          <strong>ETB {car.pricePerDay}</strong>

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
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setPickUpDate(e.target.value)}
            required
          />
        </div>

        <div className="booking-field">
          <label htmlFor="return">Return date</label>
          <input
            type="date"
            id="return"
            value={returnDate}
            min={pickUpDate || new Date().toISOString().split("T")[0]}
            onChange={(e) => setReturnDate(e.target.value)}
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
            
          />
        </div>

        <div className="booking-field">
          <label htmlFor="tel">Phone number</label>
          <input
            type="tel"
            id="tel"
            placeholder="Enter phone number"
            autoComplete="tel"
            required
          />
        </div>
      </div>

      <button type="submit"   className="booking-submit-button">

        <a href="/PaymentPage"></a>
        Pay-Now
        
      </button>

  <Link href="/cars" className="">Back to Car</Link>

    
    </form>
  );
}