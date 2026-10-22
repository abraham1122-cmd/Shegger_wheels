


"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  useEffect(() => {
    const savedBooking = sessionStorage.getItem("Booking_pending");

    if (savedBooking) {
      setBooking(JSON.parse(savedBooking));
    }
  }, []);

  if (!booking) {
    return <main className="p-8">No pending booking found.</main>;
  }

  const pickup = new Date(`${booking.pickUpDate}T00:00:00`);
  const returnDate = new Date(`${booking.returnDate}T00:00:00`);

  const validDates =
    Number.isFinite(pickup.getTime()) &&
    Number.isFinite(returnDate.getTime()) &&
    returnDate > pickup;

  const rentalDays = validDates
    ? Math.ceil((returnDate - pickup) / (1000 * 60 * 60 * 24))
    : 0;

    console.log("saved booking:", booking);
  const pricePerDay = Number(booking.pricePerDay);
  const totalPrice =
    validDates && Number.isFinite(pricePerDay) && pricePerDay >= 0
      ? rentalDays * pricePerDay
      : 0;

  function confirmBooking() {
    if (!validDates || !Number.isFinite(pricePerDay) || pricePerDay <= 0) {
      alert("Please check the rental dates and daily price.");
      return;
    }

    const newBooking = {
      ...booking,
      rentalDays,
      totalPrice,
      paymentMethod,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(
      localStorage.getItem("rental_bookings") || "[]"
    );

    localStorage.setItem(
      "rental_bookings",
      JSON.stringify([...existingBookings, newBooking])
    );

    sessionStorage.removeItem("Booking_pending");

    window.location.href = "/owner/bookings";
  }

  return (
    <main className="payment-page">
      <h1>Payment Summary</h1>

      <section>
        <h2>{booking.carName}</h2>

        <p>Price per day: ETB {pricePerDay.toLocaleString()}</p>
        <p>Pickup date: {booking.pickUpDate}</p>
        <p>Return date: {booking.returnDate}</p>
        <p>Rental duration: {rentalDays} days</p>

        <h2>Total: ETB {totalPrice.toLocaleString()}</h2>
      </section>

      <section>
        <h2>Choose payment method</h2>

        <label>
          <input
            type="radio"
            value="Cash"
            checked={paymentMethod === "Cash"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Cash
        </label>

        <label>
          <input
            type="radio"
            value="Telebirr"
            checked={paymentMethod === "Telebirr"}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Telebirr 
        </label>
      </section>

      <button
        type="button"
        onClick={confirmBooking}
        disabled={!validDates || !Number.isFinite(pricePerDay) || pricePerDay <= 0}
      >
        Confirm Booking
      </button>

      <Link href="/bookings">Back to Booking Form</Link>
    </main>
  );

}