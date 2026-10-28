"use client";

import { useState } from "react";
import {
  getDisputes,
  saveDisputes,
} from "@/lib/disputeStorage";

import "./dispute-details.css"

const MAX_FILE_SIZE = 750 * 1024;
const CLOSED_STATUSES = ["Resolved", "Closed"];
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

export default function DisputeEvidence({
  dispute,
  currentUser,
  onUpdate,
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!dispute || !currentUser?.id) return null;

  const isAdmin = currentUser.role === "admin";

  const isRenter =
    currentUser.role === "renter" &&
    String(currentUser.id) === String(dispute.renterId);

  const isOwner =
    currentUser.role === "owner" &&
    String(currentUser.id) === String(dispute.ownerId);

  const canView = isAdmin || isRenter || isOwner;
  const isClosed = CLOSED_STATUSES.includes(dispute.status);

  const evidence = [
    ...(dispute.renterEvidence || []).map((item) => ({
      ...item,
      submittedByRole: "renter",
    })),
    ...(dispute.ownerEvidence || []).map((item) => ({
      ...item,
      submittedByRole: "owner",
    })),
  ];

  async function handleUpload(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!canView) {
      setError("You cannot access this dispute.");
      return;
    }

    if (!isRenter && !isOwner) {
      setError("Only the renter or owner can submit evidence.");
      return;
    }

    if (isClosed) {
      setError("This dispute is no longer accepting evidence.");
      return;
    }

    const form = event.currentTarget;
    const input = form.elements.namedItem("evidence");
    const file = input?.files?.[0];

    if (!file) {
      setError("Please select a file.");
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("The file must be 750 KB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result !== "string") {
            reject(new Error("Could not read the selected file."));
            return;
          }

          resolve(reader.result);
        };

        reader.onerror = () => {
          reject(new Error("Could not read the selected file."));
        };

        reader.readAsDataURL(file);
      });

      const disputes = getDisputes();

      const index = disputes.findIndex(
        (item) => String(item.id) === String(dispute.id)
      );

      if (index === -1) {
        throw new Error("Dispute not found.");
      }

      const latest = disputes[index];

      const participantAuthorized =
        (isRenter &&
          String(latest.renterId) === String(currentUser.id)) ||
        (isOwner &&
          String(latest.ownerId) === String(currentUser.id));

      if (!participantAuthorized) {
        throw new Error("You cannot submit evidence to this dispute.");
      }

      if (CLOSED_STATUSES.includes(latest.status)) {
        throw new Error("This dispute is no longer accepting evidence.");
      }

      const field = isRenter ? "renterEvidence" : "ownerEvidence";

      const record = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        submittedBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      disputes[index] = {
        ...latest,
        [field]: [...(latest[field] || []), record],
        updatedAt: new Date().toISOString(),
      };

      saveDisputes(disputes);

      input.value = "";
      setSuccess("Evidence added successfully.");
      onUpdate?.();
    } catch (err) {
      setError(
        err.message || "Unable to save evidence. Check browser storage."
      );
    } finally {
      setUploading(false);
    }
  }

  if (!canView) {
    return (
      <p role="alert" className="dispute-evidence-unauthorized">
        You are not authorized to view this evidence.
      </p>
    );
  }

  return (
    <section className="dispute-evidence">
      <header className="dispute-evidence-header">
        <div>
          <h2 className="dispute-evidence-title">
            Supporting Evidence
          </h2>
          <p className="dispute-evidence-description">
            Review documents and images submitted for this dispute.
          </p>
        </div>

        <span className="dispute-evidence-count">
          {evidence.length} {evidence.length === 1 ? "file" : "files"}
        </span>
      </header>

      {evidence.length === 0 ? (
        <div className="dispute-evidence-empty">
          <span
            className="dispute-evidence-empty-icon"
            aria-hidden="true"
          >
            &#128196;
          </span>

          <h3>No evidence submitted</h3>

          <p>
            Uploaded documents and images will appear here.
          </p>
        </div>
      ) : (
        <ul className="dispute-evidence-list">
          {evidence.map((item) => (
            <li
              key={item.id}
              className="dispute-evidence-item"
            >
              <div className="dispute-evidence-file-icon" aria-hidden="true">
                {item.type === "application/pdf" ? "PDF" : "IMG"}
              </div>

              <div className="dispute-evidence-file-info">
                <p className="dispute-evidence-file-name">
                  {item.name}
                </p>

                <div className="dispute-evidence-file-meta">
                  <span>
                    Submitted by {item.submittedByRole}
                  </span>

                  {Number.isFinite(item.size) && (
                    <span>
                      {(item.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              </div>

              {item.dataUrl && (
                <a
                  href={item.dataUrl}
                  download={item.name}
                  target="_blank"
                  rel="noreferrer"
                  className="dispute-evidence-download"
                  aria-label={`View or download ${item.name}`}
                >
                  View / Download
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {(isRenter || isOwner) && !isClosed && (
        <form
          onSubmit={handleUpload}
          className="dispute-evidence-form"
        >
          <div className="dispute-evidence-form-heading">
            <h3>Add supporting evidence</h3>
            <p>
              Accepted formats: JPG, PNG, and PDF. Maximum size: 750 KB.
            </p>
          </div>

          <label
            htmlFor="evidence"
            className="dispute-evidence-label"
          >
            Choose a file
          </label>

          <input
            id="evidence"
            name="evidence"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            required
            disabled={uploading}
            className="dispute-evidence-input"
          />

          <button
            type="submit"
            disabled={uploading}
            className="dispute-evidence-submit"
          >
            {uploading ? "Uploading..." : "Submit Evidence"}
            {!uploading && (
              <span aria-hidden="true">&nbsp;→</span>
            )}
          </button>
        </form>
      )}

      {isClosed && (
        <div className="dispute-evidence-closed">
          Evidence submission is disabled because this dispute is{" "}
          {dispute.status.toLowerCase()}.
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="dispute-evidence-message dispute-evidence-error"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="dispute-evidence-message dispute-evidence-success"
        >
          {success}
        </p>
      )}
    </section>
  );
}