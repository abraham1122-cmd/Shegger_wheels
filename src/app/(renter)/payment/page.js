
"use client";

import "./payment.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentPage() {
  const [booking, setBooking] = useState(null);
  const [pickUpDate, setPickUpDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [telebirrNumber, setTelebirrNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [conformationMessage, setConformationMessage] = useState("");

  useEffect(() => {
    try {
      const savedBooking = sessionStorage.getItem("Booking_pending");

      if (savedBooking) {
        const data = JSON.parse(savedBooking);

        setBooking(data);
        setPickUpDate(data.pickUpDate || "");
        setReturnDate(data.returnDate || "");
      }
    } catch {
      setBooking(null);
    }
  }, []);

  if (!booking) {
    return (
      <main className="payment-page">
        <h1>No pending booking found</h1>
        <p>Please select a car and complete the booking form first.</p>
        <Link href="/cars">Browse Cars</Link>
      </main>
    );
  }

   
  
  const pricePerDay = Number(booking.pricePerDay);

  
  const pickupTime = pickUpDate
    ? Date.parse(`${pickUpDate}T00:00:00Z`)
    : NaN;

  const returnTime = returnDate
    ? Date.parse(`${returnDate}T00:00:00Z`)
    : NaN;

  const validDates =
    Number.isFinite(pickupTime) &&
    Number.isFinite(returnTime) &&
    returnTime > pickupTime;

  const rentalDays = validDates
    ? (returnTime - pickupTime) / (1000 * 60 * 60 * 24)
    : 0;

  const validPrice =
    Number.isFinite(pricePerDay) && pricePerDay > 0;

  const totalPrice =
    validDates && validPrice
      ? rentalDays * pricePerDay
      : 0;

  function confirmBooking(event) {
    event.preventDefault();

     setConformationMessage("Your booking submitted succesfully.")

    if (!validDates) {
      alert("Return date must be later than pickup date.");
      return;
    }

    if (!validPrice) {
      alert("The daily price is invalid. Please book the car again.");
      return;
    }

    if (
      paymentMethod === "Telebirr" &&
      !/^09\d{8}$/.test(telebirrNumber)
    ) {
      alert("Enter a valid 10-digit number starting with 09.");
      return;
    }

    if (
      paymentMethod === "Bank Transfer" &&
      (!bankName.trim() ||
        !accountName.trim() ||
        !transactionReference.trim())
    ) {
      alert("Please complete all bank transfer fields.");
      return;
    }

    try {
      const existingBookings = JSON.parse(
        localStorage.getItem("rental_bookings") || "[]"
      );

      if (!Array.isArray(existingBookings)) {
        throw new Error("Invalid booking data");
      }

      const newBooking = {
        ...booking,
        pickUpDate,
        returnDate,
        pricePerDay,
        rentalDays,
        totalPrice,
        paymentMethod,
        telebirrNumber:
          paymentMethod === "Telebirr" ? telebirrNumber : "",
        bankDetails:
          paymentMethod === "Bank Transfer"
            ? {
                bankName,
                accountName,
                transactionReference,
              }
            : null,
        status: "Pending",
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        "rental_bookings",
        JSON.stringify([...existingBookings, newBooking])
      );

      sessionStorage.removeItem("Booking_pending");
    //   window.location.href = "/owner/bookings";
        setConformationMessage("Your Booking submitted successfully!")
    } catch {
      alert("Could not save the booking. Please try again.");
    }
  }

  return (
    <main className="payment-page">
      <h1>Payment Summary</h1>
     
      <form onSubmit={confirmBooking}>
        <section className="payment-summary">
          <h2>{booking.carName || "Selected Car"}</h2>

          <p>
            Price per day:{" "}
            <strong>
              {validPrice
                ? `ETB ${pricePerDay.toLocaleString()}`
                : "Price unavailable"}
            </strong>
          </p>

          <div className="payment-field">
            <label htmlFor="pickup-date">Pickup date</label>
            <input
              id="pickup-date"
              type="date"
              value={pickUpDate}
              onChange={(e) => {
                setPickUpDate(e.target.value);

                if (
                  returnDate &&
                  e.target.value &&
                  returnDate <= e.target.value
                ) {
                  setReturnDate("");
                }
              }}
              required
            />
          </div>

          <div className="payment-field">
            <label htmlFor="return-date">Return date</label>
            <input
              id="return-date"
              type="date"
              value={returnDate}
              min={pickUpDate || undefined}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </div>

          <p>Rental duration: {rentalDays} day(s)</p>

          {!validDates && (
            <p className="payment-error">
              Choose a return date later than your pickup date.
            </p>
          )}

          <h2 className="payment-total">
            Total price: ETB {totalPrice.toLocaleString()}
          </h2>

          <p className="payment-note">
           
          </p>
        </section>

        <section className="payment-method">
          <h2>Choose payment method</h2>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="Cash"
              checked={paymentMethod === "Cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash
          </label>

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="Telebirr"
              checked={paymentMethod === "Telebirr"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Telebirr
          </label>

          {paymentMethod === "Telebirr" && (
            <div className="payment-field">
              <label htmlFor="telebirr-number">
                Telebirr mobile number
              </label>
              <input
                id="telebirr-number"
                type="tel"
                inputMode="numeric"
                placeholder="09XXXXXXXX"
                value={telebirrNumber}
                onChange={(e) => setTelebirrNumber(e.target.value)}
                pattern="09[0-9]{8}"
                maxLength={10}
                required
              />
           
            </div>
          )}

          <label className="payment-option">
            <input
              type="radio"
              name="paymentMethod"
              value="Bank Transfer"
              checked={paymentMethod === "Bank Transfer"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Bank Transfer
          </label>

          {paymentMethod === "Bank Transfer" && (
            <div className="bank-transfer-fields">
              <div className="payment-field">
                <label htmlFor="bank-name">Bank name</label>
                <select
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                >
                  <option value="">Select a bank</option>
                  <option value="Commercial Bank of Ethiopia">
                    Commercial Bank of Ethiopia
                  </option>
                  <option value="Awash Bank">Awash Bank</option>
                  <option value="Dashen Bank">Dashen Bank</option>
                  <option value="Bank of Abyssinia">
                    Bank of Abyssinia
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="payment-field">
                <label htmlFor="account-name">Account holder name</label>
                <input
                  id="account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter account holder name"
                  required
                />
              </div>

              <div className="payment-field">
                <label htmlFor="transaction-reference">
                  Transaction reference
                </label>
                <input
                  id="transaction-reference"
                  type="text"
                  value={transactionReference}
                  onChange={(e) =>
                    setTransactionReference(e.target.value)
                  }
                  placeholder="Enter transaction/reference number"
                  required
                />
              </div>

              <p className="payment-note">
          
              </p>
            </div>
          )}
        </section>

        <button
          className="confirm-booking-button"
          type="submit"
          disabled={!validDates || !validPrice}
        >
          Submit Booking
        </button>

        {conformationMessage && (
  <p className="payment-success">
    {conformationMessage}
  </p>
)}


      
      </form>

        <Link className="payment-back-link" href="/cars">
          Back to Cars
        </Link>
    </main>
  );
}
