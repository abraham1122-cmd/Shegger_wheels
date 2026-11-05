"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import DisputeCard from "@/components/disputes/dispute-card";
import { getDisputesForUser } from "@/lib/disputeStorage";
import { getSession } from "@/lib/sessions";

import "./admin-disputes.css";

const ALL_STATUSES = [
  "Open",
  "Under Review",
  "Awaiting Response",
  "Resolved",
  "Closed",
];

export default function AdminDisputesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDisputes = useCallback(() => {
    try {
      const session = getSession();

      if (!session) {
        setCurrentUser(null);
        setDisputes([]);
        setError("Please sign in as an administrator.");
        return;
      }

      const user = {
        ...session,
        id: session.id ?? session.userId,
      };

      if (user.role !== "admin" || !user.id) {
        setCurrentUser(null);
        setDisputes([]);
        setError("Administrator access is required.");
        return;
      }

      setCurrentUser(user);
      setDisputes(getDisputesForUser(user));
      setError("");
    } catch {
      setError("Unable to load disputes.");
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

  const categories = useMemo(
    () => [
      ...new Set(
        disputes.map((item) => item.category).filter(Boolean)
      ),
    ],
    [disputes]
  );

  const filteredDisputes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return disputes.filter((dispute) => {
      const matchesStatus =
        statusFilter === "All" || dispute.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        dispute.category === categoryFilter;

      const matchesSearch =
        !term ||
        [
          dispute.id,
          dispute.subject,
          dispute.description,
          dispute.bookingId,
          dispute.renterId,
          dispute.ownerId,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [disputes, statusFilter, categoryFilter, search]);

  if (loading) {
    return (
      <main className="admin-disputes-page">
        <div className="admin-disputes-container">
          <p className="admin-disputes-loading">
            Loading all disputes...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-disputes-page">
      <div className="admin-disputes-container">
        <header className="admin-disputes-header">
          <div>
            <h1>Dispute Administration</h1>
            <p>
              Review complaints, investigate evidence, and record final
              decisions.
            </p>
          </div>
        </header>

        {error ? (
          <section className="admin-disputes-error" role="alert">
            <p>{error}</p>

            {!currentUser && (
              <div className="admin-disputes-signin">
                <Link href="/signin">Sign in</Link>
              </div>
            )}
          </section>
        ) : (
          <>
            <section
              className="admin-disputes-stats"
              aria-label="Dispute statistics"
            >
              <article className="admin-disputes-stat-card">
                <p>Total</p>
                <span>{disputes.length}</span>
              </article>

              <article className="admin-disputes-stat-card">
                <p>Open</p>
                <span>
                  {
                    disputes.filter(
                      (item) => item.status === "Open"
                    ).length
                  }
                </span>
              </article>

              <article className="admin-disputes-stat-card">
                <p>Under review</p>
                <span>
                  {
                    disputes.filter(
                      (item) => item.status === "Under Review"
                    ).length
                  }
                </span>
              </article>

              <article className="admin-disputes-stat-card">
                <p>Resolved or closed</p>
                <span>
                  {
                    disputes.filter((item) =>
                      ["Resolved", "Closed"].includes(item.status)
                    ).length
                  }
                </span>
              </article>
            </section>

            <section className="admin-disputes-filters">
              <div className="admin-disputes-search">
                <label htmlFor="disputeSearch">
                  Search disputes
                </label>

                <input
                  id="disputeSearch"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search subject, booking, renter or owner..."
                />
              </div>

              <div className="admin-disputes-filter-field">
                <label htmlFor="statusFilter">Status</label>

                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All statuses</option>

                  {ALL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-disputes-filter-field">
                <label htmlFor="categoryFilter">Category</label>

                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(event) =>
                    setCategoryFilter(event.target.value)
                  }
                >
                  <option value="All">All categories</option>

                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-disputes-filter-actions">
                <button
                  type="button"
                  className="admin-disputes-secondary-button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setCategoryFilter("All");
                  }}
                >
                  Clear filters
                </button>
              </div>
            </section>

            <div className="admin-disputes-results-header">
              <h2>
                Disputes ({filteredDisputes.length})
              </h2>

              <button
                type="button"
                className="admin-disputes-secondary-button"
                onClick={loadDisputes}
              >
                Refresh
              </button>
            </div>

            {filteredDisputes.length === 0 ? (
              <section className="admin-disputes-empty">
                <h2>No matching disputes</h2>
                <p>
                  Try changing your filters or search term.
                </p>
              </section>
            ) : (
              <section
                className="admin-disputes-list"
                aria-label="Dispute results"
              >
                {filteredDisputes.map((dispute) => (
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