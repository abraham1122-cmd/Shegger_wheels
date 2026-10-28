"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import DisputeCard from "@/components/disputes/dispute-card";
import { getDisputesForUser } from "@/lib/disputeStorage";
import { getSession } from "@/lib/sessions";

import "./owner-disputes.css"

export default function OwnerDisputesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDisputes = useCallback(() => {
    try {
      setError("");

      const session = getSession();

      if (!session) {
        setCurrentUser(null);
        setDisputes([]);
        setError("Please sign in to view owner disputes.");
        return;
      }

      const user = {
        ...session,
        id: session.id ?? session.userId,
      };

      if (user.role !== "owner" || !user.id) {
        setCurrentUser(null);
        setDisputes([]);
        setError("This page is available to car owners only.");
        return;
      }

      setCurrentUser(user);
      setDisputes(getDisputesForUser(user));
    } catch (error) {
      console.error("Error loading owner disputes:", error);
      setCurrentUser(null);
      setDisputes([]);
      setError("Unable to load owner disputes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();

    window.addEventListener("disputes-updated", loadDisputes);
    window.addEventListener("storage", loadDisputes);

    return () => {
      window.removeEventListener("disputes-updated", loadDisputes);
      window.removeEventListener("storage", loadDisputes);
    };
  }, [loadDisputes]);

  const needsAttentionCount = disputes.filter(
    (dispute) => !["Resolved", "Closed"].includes(dispute.status)
  ).length;

  const resolvedCount = disputes.filter(
    (dispute) => ["Resolved", "Closed"].includes(dispute.status)
  ).length;

  if (loading) {
    return (
      <main className="owner-disputes-page">
        <div className="owner-disputes-container">
          <p className="owner-disputes-loading">
            Loading disputes...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-disputes-page">
      <div className="owner-disputes-container">
        <header className="owner-disputes-header">
          <p className="owner-disputes-eyebrow">
            Owner dashboard / Disputes
          </p>

          <h1 className="owner-disputes-title">
            Dispute Management
          </h1>

          <p className="owner-disputes-description">
            Review renter complaints, respond with relevant details, and
            provide supporting evidence.
          </p>
        </header>

        {error ? (
          <section className="owner-disputes-error" role="alert">
            <p>{error}</p>

            {!currentUser && (
              <Link
                href="/signin"
                className="owner-disputes-signin-link"
              >
                Sign in
              </Link>
            )}
          </section>
        ) : (
          <>
            <section
              className="owner-disputes-stats"
              aria-label="Dispute statistics"
            >
              <article className="owner-disputes-stat-card">
                <p className="owner-disputes-stat-label">
                  All disputes
                </p>

                <p className="owner-disputes-stat-value">
                  {disputes.length}
                </p>
              </article>

              <article className="owner-disputes-stat-card owner-disputes-stat-attention">
                <p className="owner-disputes-stat-label">
                  Need attention
                </p>

                <p className="owner-disputes-stat-value">
                  {needsAttentionCount}
                </p>
              </article>

              <article className="owner-disputes-stat-card owner-disputes-stat-resolved">
                <p className="owner-disputes-stat-label">
                  Resolved or closed
                </p>

                <p className="owner-disputes-stat-value">
                  {resolvedCount}
                </p>
              </article>
            </section>

            <section className="owner-disputes-content">
              <div className="owner-disputes-section-header">
                <div>
                  <h2 className="owner-disputes-section-title">
                    Your disputes
                  </h2>

                  <p className="owner-disputes-section-description">
                    View complaints associated with your rental bookings.
                  </p>
                </div>

                <button
                  type="button"
                  className="owner-disputes-refresh-button"
                  onClick={loadDisputes}
                >
                  Refresh
                </button>
              </div>

              {disputes.length === 0 ? (
                <div className="owner-disputes-empty">
                  <h2 className="owner-disputes-empty-title">
                    No disputes assigned to you
                  </h2>

                  <p className="owner-disputes-empty-description">
                    Disputes related to your rental bookings will appear
                    here.
                  </p>
                </div>
              ) : (
                <div className="owner-disputes-list">
                  {disputes.map((dispute) => (
                    <DisputeCard
                      key={dispute.id}
                      dispute={dispute}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}