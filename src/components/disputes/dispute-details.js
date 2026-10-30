"use client";

import { useState } from "react";

import DisputeEvidence from "./dispute-evidence";
import DisputeForm from "./dispute-form";

import "./dispute-details.css";

export default function DisputeDetails({
  dispute,
  currentUser,
  onUpdate,
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!dispute || !currentUser?.id) {
    return (
      <p className="dispute-details-unavailable">
        Dispute information is unavailable.
      </p>
    );
  }

  const isAdmin = currentUser.role === "admin";

  const isRenter =
    currentUser.role === "renter" &&
    String(currentUser.id) === String(dispute.renterId);

  const isOwner =
    currentUser.role === "owner" &&
    String(currentUser.id) === String(dispute.ownerId);

  if (!isAdmin && !isRenter && !isOwner) {
    return (
      <p className="dispute-details-unauthorized" role="alert">
        You are not authorized to view this dispute.
      </p>
    );
  }

  function refresh() {
    setRefreshKey((value) => value + 1);
    onUpdate?.();
  }

  const status = dispute.status || "Open";

  const statusClass = status
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div
      key={refreshKey}
      className="dispute-details-layout"
    >
      
      <section className="dispute-details-card dispute-overview-card">
        <div className="dispute-overview-header">
          <div className="dispute-overview-heading">
            <p className="dispute-reference">
              DISPUTE #{String(dispute.id).slice(0, 8)}
            </p>

            <h1 className="dispute-subject">
              {dispute.subject || "Untitled dispute"}
            </h1>
          </div>

          <span
            className={`dispute-status-badge dispute-status-${statusClass}`}
          >
            {status}
          </span>
        </div>

        {/* Dispute information */}
        <div className="dispute-information-grid">
          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Booking ID
            </span>

            <span className="dispute-information-value">
              {dispute.bookingId || "Not linked"}
            </span>
          </div>

          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Car ID
            </span>

            <span className="dispute-information-value">
              {dispute.carId || "Not linked"}
            </span>
          </div>

          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Renter ID
            </span>

            <span className="dispute-information-value dispute-break-text">
              {dispute.renterId || "Not available"}
            </span>
          </div>

          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Owner ID
            </span>

            <span className="dispute-information-value dispute-break-text">
              {dispute.ownerId || "Not available"}
            </span>
          </div>

          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Category
            </span>

            <span className="dispute-information-value">
              {dispute.category || "Uncategorized"}
            </span>
          </div>

          <div className="dispute-information-item">
            <span className="dispute-information-label">
              Raised by
            </span>

            <span className="dispute-information-value">
              {dispute.raisedByRole || "Unknown"}
            </span>
          </div>
        </div>

        {/* Complaint description */}
        <div className="dispute-description-section">
          <h2 className="dispute-section-title">
            Complaint description
          </h2>

          <p className="dispute-description-text">
            {dispute.description || "No description provided."}
          </p>
        </div>

        {/* Timestamps */}
        <div className="dispute-timestamps">
          <p>
            <span>Created:</span>{" "}
            {dispute.createdAt
              ? new Date(dispute.createdAt).toLocaleString()
              : "Unknown"}
          </p>

          <p>
            <span>Last updated:</span>{" "}
            {dispute.updatedAt
              ? new Date(dispute.updatedAt).toLocaleString()
              : "Unknown"}
          </p>
        </div>
      </section>

      {/* Evidence */}
      <section className="dispute-details-card dispute-evidence-card">
        <div className="dispute-card-heading">
          <span className="dispute-card-accent" aria-hidden="true" />
          <h2 className="dispute-section-title">
            Supporting evidence
          </h2>
        </div>

        <DisputeEvidence
          key={`${dispute.id}-${refreshKey}`}
          dispute={dispute}
          currentUser={currentUser}
          onUpdate={refresh}
        />
      </section>

      {/* Owner response */}
      <section className="dispute-details-card dispute-response-card">
        <div className="dispute-card-heading">
          <span className="dispute-card-accent" aria-hidden="true" />
          <h2 className="dispute-section-title">
            Owner's response
          </h2>
        </div>

        <p className="dispute-content-text">
          {dispute.ownerResponse ||
            "No owner response submitted yet."}
        </p>

        {isOwner &&
          !["Resolved", "Closed"].includes(dispute.status) && (
            <div className="dispute-response-form">
              <DisputeForm
                key={`${dispute.id}-${refreshKey}-response`}
                mode="respond"
                currentUser={currentUser}
                disputeId={dispute.id}
                onSuccess={refresh}
              />
            </div>
          )}
      </section>

     
      <section className="dispute-details-card dispute-decision-card">
        <div className="dispute-card-heading">
          <span className="dispute-card-accent" aria-hidden="true" />
          <h2 className="dispute-section-title">
            Admin decision
          </h2>
        </div>

        <p className="dispute-content-text">
          {dispute.adminDecision || "No decision recorded yet."}
        </p>

        {dispute.adminNote && (
          <div className="dispute-admin-information">
            <h3 className="dispute-subsection-title">
              Admin's explanation
            </h3>

            <p className="dispute-content-text">
              {dispute.adminNote}
            </p>
          </div>
        )}

        {dispute.resolution && (
          <div className="dispute-admin-information">
            <h3 className="dispute-subsection-title">
              Resolution
            </h3>

            <p className="dispute-content-text">
              {dispute.resolution}
            </p>
          </div>
        )}
      </section>

     
      {isRenter &&
        !["Resolved", "Closed"].includes(dispute.status) && (
          <p className="dispute-role-notice">
            Your dispute is being handled by the owner and platform
            administration. You can submit additional evidence above.
          </p>
        )}

      {isAdmin && (
        <p className="dispute-role-notice">
          Review the complaint, owner response, and evidence before
          recording your decision in the admin interface.
        </p>
      )}
    </div>
  );
}