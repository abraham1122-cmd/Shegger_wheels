



"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/sessions";
import {
  getDisputesForUser,
  DISPUTE_STATUSES,
} from "@/lib/disputeStorage";

export default function DisputeStatusSummary() {
  const [counts, setCounts] = useState({});
  const [ready, setReady] = useState(false);

  const refreshCounts = useCallback(() => {
    const session = getSession();

    if (session?.role !== "admin") {
      setCounts({});
      setReady(true);
      return;
    }

    const disputes = getDisputesForUser(session);

    const nextCounts = Object.fromEntries(
      DISPUTE_STATUSES.map((status) => [
        status,
        disputes.filter((dispute) => dispute.status === status).length,
      ])
    );

    setCounts(nextCounts);
    setReady(true);
  }, []);

  useEffect(() => {
    refreshCounts();

    window.addEventListener("disputes-updated", refreshCounts);
    window.addEventListener("storage", refreshCounts);

    return () => {
      window.removeEventListener("disputes-updated", refreshCounts);
      window.removeEventListener("storage", refreshCounts);
    };
  }, [refreshCounts]);

  if (!ready) return <p>Loading dispute statistics...</p>;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Dispute Overview</h2>

        <Link
          href="/disputes"
          className="text-sm font-medium text-blue-600"
        >
          Manage disputes
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {DISPUTE_STATUSES.map((status) => (
          <div key={status} className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm text-gray-600">{status}</p>
            <p className="mt-1 text-2xl font-bold">
              {counts[status] ?? 0}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}