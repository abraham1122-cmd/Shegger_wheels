
"use client";

import { useState } from "react";
import {
  createDispute,
  getDisputes,
  saveDisputes,
} from "@/lib/disputeStorage";

import "./dispute-details.css";

const CATEGORIES = [
  "Vehicle not provided",
  "Vehicle damage",
  "Late return",
  "Payment or refund",
  "Cancellation",
  "Other",
];

const CLOSED_STATUSES = ["Resolved", "Closed"];

export default function DisputeForm({
  mode = "create",
  currentUser,
  bookingId = null,
  carId = null,
  renterId,
  ownerId,
  disputeId,
  onSuccess,
}) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentUser?.id || !currentUser?.role) {
      setError("Please sign in first.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "create") {
        if (!["renter", "owner"].includes(currentUser.role)) {
          throw new Error(
            "Only renters and owners can open disputes."
          );
        }

        if (
          renterId == null ||
          ownerId == null ||
          !bookingId
        ) {
          throw new Error(
            "A valid booking and its renter and owner are required."
          );
        }

        if (!subject.trim()) {
          throw new Error("Please enter a subject.");
        }

        if (!description.trim()) {
          throw new Error("Please describe the problem.");
        }

        createDispute({
          bookingId,
          carId,
          renterId,
          ownerId,
          raisedBy: currentUser.id,
          raisedByRole: currentUser.role,
          category,
          subject: subject.trim(),
          description: description.trim(),
        });

        setSubject("");
        setDescription("");
        setCategory(CATEGORIES[0]);
        setSuccess("Your dispute has been submitted.");
        onSuccess?.();
      } else if (mode === "respond") {
        if (currentUser.role !== "owner") {
          throw new Error(
            "Only the owner can submit this response."
          );
        }

        if (!response.trim()) {
          throw new Error("Please enter your response.");
        }

        const disputes = getDisputes();

        const index = disputes.findIndex(
          (item) => String(item.id) === String(disputeId)
        );

        if (index === -1) {
          throw new Error("Dispute not found.");
        }

        const dispute = disputes[index];

        if (
          String(dispute.ownerId) !== String(currentUser.id)
        ) {
          throw new Error(
            "You cannot respond to another owner's dispute."
          );
        }

        if (CLOSED_STATUSES.includes(dispute.status)) {
          throw new Error(
            "This dispute is no longer accepting responses."
          );
        }

        disputes[index] = {
          ...dispute,
          ownerResponse: response.trim(),
          status: "Under Review",
          updatedAt: new Date().toISOString(),
        };

        saveDisputes(disputes);

        setResponse("");
        setSuccess("Your response has been submitted.");
        onSuccess?.();
      } else {
        throw new Error("Unsupported form mode.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const isRespondMode = mode === "respond";

  return (
    <form
      onSubmit={handleSubmit}
      className="dispute-form"
    >
      <header className="dispute-form-header">
        <div className="dispute-form-heading-icon" aria-hidden="true">
          {isRespondMode ? "↩" : "!"}
        </div>

        <div className="dispute-form-heading-content">
          <h2 className="dispute-form-title">
            {isRespondMode
              ? "Respond to Dispute"
              : "Open a Dispute"}
          </h2>

          <p className="dispute-form-description">
            {isRespondMode
              ? "Explain your side of the dispute for review."
              : "Provide details about the issue with your rental."}
          </p>
        </div>
      </header>

      {!isRespondMode ? (
        <>
          <div className="dispute-form-field">
            <label
              htmlFor="dispute-category"
              className="dispute-form-label"
            >
              Dispute Category
              <span className="dispute-form-required"> *</span>
            </label>

            <select
              id="dispute-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="dispute-form-select"
              required
              disabled={submitting}
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="dispute-form-field">
            <label
              htmlFor="dispute-subject"
              className="dispute-form-label"
            >
              Subject
              <span className="dispute-form-required"> *</span>
            </label>

            <input
              id="dispute-subject"
              type="text"
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setError("");
              }}
              required
              maxLength={120}
              disabled={submitting}
              className="dispute-form-input"
              placeholder="Briefly describe the problem"
            />

            <p className="dispute-form-hint">
              {subject.length}/120 characters
            </p>
          </div>

          <div className="dispute-form-field">
            <label
              htmlFor="dispute-description"
              className="dispute-form-label"
            >
              Description
              <span className="dispute-form-required"> *</span>
            </label>

            <textarea
              id="dispute-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError("");
              }}
              required
              maxLength={3000}
              rows={5}
              disabled={submitting}
              className="dispute-form-textarea"
              placeholder="Explain what happened and include relevant details..."
            />

            <p className="dispute-form-hint">
              {description.length}/3000 characters
            </p>
          </div>
        </>
      ) : (
        <div className="dispute-form-field">
          <label
            htmlFor="owner-response"
            className="dispute-form-label"
          >
            Your Response
            <span className="dispute-form-required"> *</span>
          </label>

          <textarea
            id="owner-response"
            value={response}
            onChange={(event) => {
              setResponse(event.target.value);
              setError("");
            }}
            required
            maxLength={3000}
            rows={5}
            disabled={submitting}
            className="dispute-form-textarea"
            placeholder="Explain your side of the dispute..."
          />

          <p className="dispute-form-hint">
            {response.length}/3000 characters
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="dispute-form-message dispute-form-error"
        >
          <span aria-hidden="true">!</span>
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="dispute-form-message dispute-form-success"
        >
          <span aria-hidden="true">✓</span>
          {success}
        </p>
      )}

      <div className="dispute-form-actions">
        <button
          type="submit"
          disabled={submitting}
          className="dispute-form-submit"
        >
          {submitting
            ? "Submitting..."
            : isRespondMode
              ? "Submit Response"
              : "Submit Dispute"}

          {!submitting && (
            <span aria-hidden="true">&nbsp;→</span>
          )}
        </button>
      </div>
    </form>
  );
}
