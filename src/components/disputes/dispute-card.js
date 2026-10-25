import Link from "next/link";

export const STATUS_STYLES = {
  Open: "bg-blue-100 text-blue-800",
  "Under Review": "bg-yellow-100 text-yellow-800",
  "Awaiting Response": "bg-orange-100 text-orange-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-200 text-gray-800",
};

export default function DisputeCard({ dispute }) {
  const statusClass =
    STATUS_STYLES[dispute.status] || STATUS_STYLES.Open;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-semibold text-gray-900">
            {dispute.subject}
          </h2>

          <p className="mt-1 break-all text-xs text-gray-500">
            ID: {dispute.id}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {dispute.status}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-600">
        <p>
          <strong>Category:</strong> {dispute.category}
        </p>

        <p>
          <strong>Booking:</strong> {dispute.bookingId || "Not linked"}
        </p>

        <p>
          <strong>Submitted:</strong>{" "}
          {new Date(dispute.createdAt).toLocaleDateString()}
        </p>

        <p>
          <strong>Last updated:</strong>{" "}
          {new Date(dispute.updatedAt).toLocaleDateString()}
        </p>
      </div>

      <Link
        href={`/disputes/${encodeURIComponent(dispute.id)}`}
        className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
      >
        View Details
      </Link>
    </article>
  );
}