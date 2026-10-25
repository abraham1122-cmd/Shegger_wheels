"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/sessions";
import { createDispute } from "@/lib/disputeStorage";

export default function DisputeForm() {
  const router = useRouter();

  const [bookingId, setBookingId] = useState("");
  const [carId, setCarId] = useState("");
  const [category, setCategory] = useState("Payment");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const session = getSession();

    if (!session || !["renter", "owner"].includes(session.role)) {
      setError("Sign in as a renter or owner to submit a dispute.");
      return;
    }

    setSubmitting(true);

    try {
      const dispute = createDispute({
        bookingId: bookingId.trim() || null,
        carId: carId.trim() || null,
        raisedBy: session.id,
        raisedByRole: session.role,
        category,
        subject,
        description,
      });

      router.push(`/disputes/${encodeURIComponent(dispute.id)}`);
    } catch (err) {
      setError(err.message || "Unable to submit the dispute.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="bookingId" className="mb-2 block font-medium">
          Booking ID (optional)
        </label>
        <input
          id="bookingId"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
          placeholder="Enter booking ID"
        />
      </div>

      <div>
        <label htmlFor="carId" className="mb-2 block font-medium">
          Car ID (optional)
        </label>
        <input
          id="carId"
          value={carId}
          onChange={(e) => setCarId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
          placeholder="Enter car ID"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-2 block font-medium">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
        >
          <option>Payment</option>
          <option>Booking</option>
          <option>Vehicle Condition</option>
          <option>Cancellation</option>
          <option>Refund</option>
          <option>Owner Conduct</option>
          <option>Renter Conduct</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block font-medium">
          Subject
        </label>
        <input
          id="subject"
          required
          maxLength={120}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
          placeholder="Briefly describe the issue"
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block font-medium">
          Description
        </label>
        <textarea
          id="description"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3"
          placeholder="Explain what happened and what resolution you need."
        />
      </div>

      <p className="text-sm text-gray-500">
        Initial status: <strong>Open</strong>. An administrator can update it
        after submission.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Dispute"}
        </button>

        <Link
          href="/disputes"
          className="inline-flex min-h-11 items-center rounded-lg border border-gray-300 px-5 py-3"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}