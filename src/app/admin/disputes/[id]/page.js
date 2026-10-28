"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getSession } from "@/lib/sessions";

import {
  getDisputes,
  updateDispute,
  DISPUTE_STATUSES,
} from "@/lib/disputeStorage";

import DisputeDetails from "@/components/disputes/dispute-details";

import "../admin-disputes.css";

function AdminDisputeDetailsContent() {
  const params = useParams();
  const disputeId = params.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [status, setStatus] = useState("Open");
  const [adminDecision, setAdminDecision] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadDispute = useCallback(() => {
    try {
      const session = getSession();

      if (!session) {
        setCurrentUser(null);
        setDispute(null);
        setError("Please sign in to access the admin dashboard.");
        return;
      }

      const user = {
        ...session,
        id: session.id ?? session.userId,
      };

      if (user.role !== "admin" || !user.id) {
        setCurrentUser(null);
        setDispute(null);
        setError("You are not authorized to view this dispute.");
        return;
      }

      const allDisputes = getDisputes();

      const foundDispute = allDisputes.find(
        (item) => String(item.id) === String(disputeId)
      );

      if (!foundDispute) {
        setCurrentUser(user);
        setDispute(null);
        setError("Dispute not found.");
        return;
      }

      setCurrentUser(user);
      setDispute(foundDispute);
      setStatus(foundDispute.status || "Open");
      setAdminDecision(foundDispute.adminDecision || "");
      setAdminNote(foundDispute.adminNote || "");
      setResolution(foundDispute.resolution || "");
      setError("");
    } catch {
      setError("Unable to load this dispute.");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    loadDispute();

    const handleUpdate = () => loadDispute();

    window.addEventListener("disputes-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("disputes-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadDispute]);

  function handleSave(event) {
    event.preventDefault();

    if (!currentUser || currentUser.role !== "admin" || !dispute) {
      setError("You are not authorized to update this dispute.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      updateDispute(
        dispute.id,
        {
          status,
          adminDecision: adminDecision.trim(),
          adminNote: adminNote.trim(),
          resolution: resolution.trim(),
        },
        currentUser
      );

      loadDispute();
      setSuccess("Dispute updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update the dispute.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-dispute-details-page">
        <div className="admin-dispute-details-container">
          <p className="admin-dispute-details-loading">
            Loading dispute...
          </p>
        </div>
      </main>
    );
  }

  if (error && !dispute) {
    return (
      <main className="admin-dispute-details-page">
        <div className="admin-dispute-details-container">
          <Link
            href="/admin/disputes"
            className="admin-dispute-back-link"
          >
            &larr; Back to disputes
          </Link>

          <section className="admin-dispute-alert admin-dispute-alert-error">
            <p>{error}</p>
          </section>
        </div>
      </main>
    );
  }

  if (!dispute || !currentUser) {
    return null;
  }

  return (
    <main className="admin-dispute-details-page">
      <div className="admin-dispute-details-container">
        <Link
          href="/admin/disputes"
          className="admin-dispute-back-link"
        >
          &larr; Back to all disputes
        </Link>

        <header className="admin-dispute-details-header">
          <p className="admin-dispute-eyebrow">
            Admin dashboard / Disputes
          </p>

          <h1>Dispute details</h1>

          <p className="admin-dispute-id">
            Dispute ID: <span>{dispute.id}</span>
          </p>
        </header>

        {error && (
          <section
            className="admin-dispute-alert admin-dispute-alert-error"
            role="alert"
          >
            <p>{error}</p>
          </section>
        )}

        {success && (
          <section
            className="admin-dispute-alert admin-dispute-alert-success"
            role="status"
          >
            <p>{success}</p>
          </section>
        )}

        <section className="admin-dispute-panel">
          <h2>Complaint and evidence</h2>

          <DisputeDetails
            dispute={dispute}
            currentUser={currentUser}
            onUpdate={loadDispute}
          />
        </section>

        <section className="admin-dispute-panel admin-dispute-review-panel">
          <h2>Admin review</h2>

          <p className="admin-dispute-panel-description">
            Update the case status, record your decision, and document
            the resolution.
          </p>

          <form
            onSubmit={handleSave}
            className="admin-dispute-review-form"
          >
            <div className="admin-dispute-form-field">
              <label htmlFor="status">Dispute status</label>

              <select
                id="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                required
              >
                {DISPUTE_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-dispute-form-field">
              <label htmlFor="adminDecision">Admin decision</label>

              <textarea
                id="adminDecision"
                value={adminDecision}
                onChange={(event) =>
                  setAdminDecision(event.target.value)
                }
                rows={3}
                placeholder="Record the decision made for this dispute..."
              />
            </div>

            <div className="admin-dispute-form-field">
              <label htmlFor="resolution">Resolution</label>

              <textarea
                id="resolution"
                value={resolution}
                onChange={(event) =>
                  setResolution(event.target.value)
                }
                rows={3}
                placeholder="Explain the agreed or final resolution..."
              />
            </div>

            <div className="admin-dispute-form-field">
              <label htmlFor="adminNote">Private admin note</label>

              <textarea
                id="adminNote"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows={3}
                placeholder="Internal notes for administrators only..."
              />

              <p className="admin-dispute-field-help">
                Keep sensitive internal notes here, not in public replies.
              </p>
            </div>

            <div className="admin-dispute-form-actions">
              <button
                type="submit"
                disabled={saving}
                className="admin-dispute-save-button"
              >
                {saving ? "Saving..." : "Save admin review"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default function AdminDisputesDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-dispute-details-page">
          <div className="admin-dispute-details-container">
            <p className="admin-dispute-details-loading">
              Loading dispute...
            </p>
          </div>
        </main>
      }
    >
      <AdminDisputeDetailsContent />
    </Suspense>
  );
}