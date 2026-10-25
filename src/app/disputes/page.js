"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";
import {
  getDisputesForUser,
  DISPUTE_STATUSES,
} from "@/lib/disputeStorage";
import DisputeCard from "@/components/disputes/dispute-card";

export default function DisputesPage() {
  const router = useRouter();

  const [disputes, setDisputes] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [ready, setReady] = useState(false);

  const refreshDisputes = useCallback(() => {
    const session = getSession();

    if (!session) {
      router.replace("/signin?next=/disputes");
      return;
    }

    setDisputes(getDisputesForUser(session));
    setReady(true);
  }, [router]);

  useEffect(() => {
    refreshDisputes();

    window.addEventListener("disputes-updated", refreshDisputes);
    window.addEventListener("storage", refreshDisputes);

    return () => {
      window.removeEventListener("disputes-updated", refreshDisputes);
      window.removeEventListener("storage", refreshDisputes);
    };
  }, [refreshDisputes]);

  if (!ready) {
    return <main className="p-6">Loading disputes...</main>;
  }

  const filteredDisputes =
    statusFilter === "All"
      ? disputes
      : disputes.filter((item) => item.status === statusFilter);

  const counts = DISPUTE_STATUSES.reduce((result, status) => {
    result[status] = disputes.filter(
      (item) => item.status === status
    ).length;

    return result;
  }, {});

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Disputes</h1>
          <p className="mt-2 text-gray-600">
            Track the progress of rental issues and resolutions.
          </p>
        </div>

        <Link
          href="/disputes/new"
          className="inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          + New Dispute
        </Link>
      </div>

      <section
        aria-label="Dispute status counts"
        className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {DISPUTE_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl border p-4 text-left ${
              statusFilter === status
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-sm text-gray-600">{status}</p>
            <p className="mt-1 text-2xl font-bold">{counts[status]}</p>
          </button>
        ))}
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {statusFilter === "All" ? "All Disputes" : statusFilter}
        </h2>

        <label className="flex items-center gap-2 text-sm">
          Filter:
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2"
          >
            <option value="All">All statuses</option>
            {DISPUTE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredDisputes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-lg font-semibold">
            {disputes.length === 0
              ? "No disputes yet"
              : "No disputes with this status"}
          </h2>

          <p className="mt-2 text-gray-600">
            {disputes.length === 0
              ? "Create a dispute if you need help resolving a rental issue."
              : "Choose another status to see more disputes."}
          </p>

          {disputes.length === 0 && (
            <Link
              href="/disputes/new"
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-600"
            >
              Create your first dispute
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredDisputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))}
        </div>
      )}
    </main>
  );
}