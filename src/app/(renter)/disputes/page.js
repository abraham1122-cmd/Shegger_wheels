
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import DisputeCard from "@/components/disputes/dispute-card";
import { getDisputesForUser } from "@/lib/disputeStorage";
import { getSession } from "@/lib/sessions";

import "./renterDisputes.css"

export default function RenterDisputesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDisputes = useCallback(() => {
    try {
      const session = getSession();

      if (!session) {
        setCurrentUser(null);
        setDisputes([]);
        setError("Please sign in to view your disputes.");
        return;
      }

      const user = {
        ...session,
        id: session.id ?? session.userId,
      };

      if (user.role !== "renter" || !user.id) {
        setCurrentUser(null);
        setDisputes([]);
        setError("This page is available to renters only.");
        return;
      }

      setCurrentUser(user);
      setDisputes(getDisputesForUser(user));
      setError("");
    } catch {
      setError("Unable to load your disputes.");
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

  if (loading) {
    return (
      <main className="renter-disputes-page">
        <div className="renter-disputes-container">
          <p className="renter-disputes-loading">
            Loading your disputes...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="renter-disputes-page">
      <div className="renter-disputes-container">
        <header className="renter-disputes-header">
          <div className="renter-disputes-heading">
            <h2 id="disp">My Disputes</h2>
            <p>
              Track complaints, review responses, and follow resolutions.
            </p>
          </div>

          <Link
            href="/bookings"
            className="renter-disputes-bookings-button"
          >
            View My Bookings
          </Link>
        </header>

        {error ? (
          <section className="renter-disputes-error" role="alert">
            <p>{error}</p>

            {!currentUser && (
              <div className="renter-disputes-signin">
                <Link href="/signin">Sign in</Link>
              </div>
            )}
          </section>
        ) : (
          <>
            <section
              className="renter-disputes-stats"
              aria-label="Dispute statistics"
            >
              <article className="renter-disputes-stat-card">
                <p>All disputes</p>
                <span>{disputes.length}</span>
              </article>

              <article className="renter-disputes-stat-card">
                <p>Open or in progress</p>
                <span>
                  {
                    disputes.filter(
                      (item) =>
                        !["Resolved", "Closed"].includes(item.status)
                    ).length
                  }
                </span>
              </article>

              <article className="renter-disputes-stat-card">
                <p>Resolved or closed</p>
                <span>
                  {
                    disputes.filter(
                      (item) =>
                        ["Resolved", "Closed"].includes(item.status)
                    ).length
                  }
                </span>
              </article>
            </section>

            {disputes.length === 0 ? (
              <section className="renter-disputes-empty">
                <h3 id="nd">No disputes yet</h3>
               

                <Link
                  href="/bookings"
                  className="renter-disputes-empty-link"
                >
                  Go to my bookings
                </Link>
              </section>
            ) : (
              <section
                className="renter-disputes-list"
                aria-label="Your disputes"
              >
                {disputes.map((dispute) => (
                  <DisputeCard
                    key={dispute.id}
                    dispute={dispute}
                    currentUser={currentUser}
                  />
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
