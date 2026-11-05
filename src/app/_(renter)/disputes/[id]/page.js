
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getSession } from "@/lib/sessions";
import { getDisputes } from "@/lib/disputeStorage";

import DisputeDetails from "@/components/disputes/dispute-details";
import DisputeMessages from "@/components/disputes/dispute-message";

import "../renterDisputes.css"

function RenterDisputeDetailsContent() {
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

      if (user.role !== "renter" || !user.id) {
        setCurrentUser(null);
        setDispute(null);
        setError(
          "Only the renter involved in this dispute can access it."
        );
        return;
      }

      const foundDispute = getDisputes().find(
        (item) => String(item.id) === String(disputeId)
      );

      if (!foundDispute) {
        setCurrentUser(user);
        setDispute(null);
        setError("Dispute not found.");
        return;
      }

      if (String(foundDispute.renterId) !== String(user.id)) {
        setCurrentUser(null);
        setDispute(null);
        setError("You are not authorized to view this dispute.");
        return;
      }

      setCurrentUser(user);
      setDispute(foundDispute);
    } catch {
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
      <main className="dispute-page">
        <div className="dispute-container">
          <p className="dispute-message">Loading dispute...</p>
        </div>
      </main>
    );
  }

  if (error || !dispute || !currentUser) {
    return (
      <main className="dispute-page">
        <div className="dispute-container">
          <Link href="/disputes" className="dispute-back-link">
            &larr; Back to my disputes
          </Link>

          <section className="dispute-feedback dispute-feedback-error">
            <h1>Unable to open dispute</h1>
            <p>{error || "This dispute could not be found."}</p>

            <Link href="/disputes" className="dispute-button">
              Return to disputes
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="dispute-page">
      <div className="dispute-container">
        <Link href="/disputes" className="dispute-back-link">
          &larr; Back to my disputes
        </Link>

        <header className="dispute-page-header">
          <p className="dispute-eyebrow">Renter dashboard / Disputes</p>
          <h1>Dispute details</h1>

          <p className="dispute-id">
            Dispute ID: <span>{dispute.id}</span>
          </p>
        </header>

        <section className="dispute-panel">
          <h2>Complaint and evidence</h2>

          <DisputeDetails
            dispute={dispute}
            currentUser={currentUser}
            onUpdate={loadDispute}
          />
        </section>

        <section className="dispute-conversation-section">
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

export default function RenterDisputeDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="dispute-page">
          <div className="dispute-container">
            <p className="dispute-message">Loading dispute...</p>
          </div>
        </main>
      }
    >
      <RenterDisputeDetailsContent />
    </Suspense>
  );
}
