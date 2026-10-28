"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getSession } from "@/lib/sessions";
import { getDisputes } from "@/lib/disputeStorage";

import DisputeDetails from "@/components/disputes/dispute-details";
import DisputeMessages from "@/components/disputes/dispute-message";

import "../owner-disputes.css";

function OwnerDisputeDetailsContent() {
  const params = useParams();
  const disputeId = params.id;

  const [currentUser, setCurrentUser] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDispute = useCallback(() => {
    setLoading(true);
    setError("");

    try {
      const session = getSession();

      if (!session) {
        setCurrentUser(null);
        setDispute(null);
        setError("Please sign in to view this dispute.");
        return;
      }

      const user = {
        ...session,
        id: session.id ?? session.userId,
      };

      if (user.role !== "owner" || !user.id) {
        setCurrentUser(null);
        setDispute(null);
        setError("Only the owner involved in this dispute can access it.");
        return;
      }

      const foundDispute = getDisputes().find(
        (item) => item.id === disputeId
      );

      if (!foundDispute) {
        setCurrentUser(user);
        setDispute(null);
        setError("Dispute not found.");
        return;
      }

      if (foundDispute.ownerId !== user.id) {
        setCurrentUser(null);
        setDispute(null);
        setError("You are not authorized to view this dispute.");
        return;
      }

      setCurrentUser(user);
      setDispute(foundDispute);
    } catch (error) {
      console.error("Error loading dispute:", error);
      setCurrentUser(null);
      setDispute(null);
      setError("Unable to load this dispute.");
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    loadDispute();

    window.addEventListener("disputes-updated", loadDispute);
    window.addEventListener("storage", loadDispute);

    return () => {
      window.removeEventListener("disputes-updated", loadDispute);
      window.removeEventListener("storage", loadDispute);
    };
  }, [loadDispute]);

  if (loading) {
    return (
      <main className="owner-disputes-page">
        <div className="owner-disputes-container">
          <p className="owner-disputes-loading">
            Loading dispute...
          </p>
        </div>
      </main>
    );
  }

  if (error || !dispute || !currentUser) {
    return (
      <main className="owner-disputes-page">
        <div className="owner-disputes-container">
          <Link
            href="/owner/disputes"
            className="owner-disputes-back-link"
          >
            &larr; Back to owner disputes
          </Link>

          <div className="owner-disputes-error" role="alert">
            {error || "Unable to load this dispute."}

            {!currentUser && (
              <div className="owner-disputes-error-action">
                <Link
                  href="/signin"
                  className="owner-disputes-signin-link"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="owner-disputes-page">
      <div className="owner-disputes-container">
        <Link
          href="/owner/disputes"
          className="owner-disputes-back-link"
        >
          &larr; Back to owner disputes
        </Link>

        <header className="owner-dispute-details-header">
          <p className="owner-disputes-eyebrow">
            Owner dashboard / Disputes
          </p>

          <h1 className="owner-dispute-details-title">
            Dispute details
          </h1>

          <p className="owner-dispute-details-id">
            <span>Dispute ID:</span> {dispute.id}
          </p>
        </header>

        <section className="owner-dispute-details-panel">
          <h2 className="owner-dispute-details-panel-title">
            Complaint and evidence
          </h2>

          <DisputeDetails
            dispute={dispute}
            currentUser={currentUser}
            onUpdate={loadDispute}
          />
        </section>

        <section className="owner-dispute-messages-section">
          <DisputeMessages
            dispute={dispute}
            currentUser={currentUser}
            onUpdate={loadDispute}
          />
        </section>
      </div>
    </main>
  );
}

export default function OwnerDisputesDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="owner-disputes-page">
          <div className="owner-disputes-container">
            <p className="owner-disputes-loading">
              Loading dispute...
            </p>
          </div>
        </main>
      }
    >
      <OwnerDisputeDetailsContent />
    </Suspense>
  );
}