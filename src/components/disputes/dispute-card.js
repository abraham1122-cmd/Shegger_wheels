
"use client";

import Link from "next/link";
// import DisputeStatusBadge from "./dispute-status-badge";

export default function DisputeCard({ dispute, currentUser }) {
  if (!dispute || !currentUser) return null;

  const role = currentUser.role;

  const detailsUrl =
    currentUser.role === "admin"
      ? `/admin/disputes/${dispute.id}`
      : currentUser.role === "owner"
        ? `/owner/disputes/${dispute.id}`
        : `/disputes/${dispute.id}`;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">
            Dispute #{String(dispute.id).slice(0, 8)}
          </p>

          <h2 className="mt-2 text-lg font-semibold text-gray-900">
            {dispute.subject}
          </h2>
        </div>
{/* 

        <DisputeStatusBadge status={dispute.status} /> */}

        <span className="" >
          {dispute.status || "open"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">
            Booking:
          </span>{" "}
          {dispute.bookingId || "Not linked"}
        </p>

        <p>
          <span className="font-medium text-gray-800">
            Category:
          </span>{" "}
          {dispute.category}
        </p>

        <p>
          <span className="font-medium text-gray-800">
            Raised by:
          </span>{" "}
          {dispute.raisedByRole}
        </p>

        <p>
          <span className="font-medium text-gray-800">
            Submitted:
          </span>{" "}
          {dispute.createdAt
            ? new Date(dispute.createdAt).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-gray-600">
        {dispute.description}
      </p>

      <div className="mt-5">
        <Link
          href={detailsUrl}
          className="inline-flex min-h-11 items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
