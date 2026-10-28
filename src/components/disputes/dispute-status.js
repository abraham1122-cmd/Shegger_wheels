
"use client";

const STATUS_STYLES = {
  Open: "bg-blue-100 text-blue-800",
  "Under Review": "bg-amber-100 text-amber-800",
  "Awaiting Response": "bg-purple-100 text-purple-800",
  Resolved: "bg-green-100 text-green-800",
  Closed: "bg-gray-200 text-gray-700",
};

const STATUSES = [
  "Open",
  "Under Review",
  "Awaiting Response",
  "Resolved",
  "Closed",
];

export default function DisputeStatus({
  status = "Open",
  userRole,
  onStatusChange,
}) {
  const styles =
    STATUS_STYLES[status] || "bg-gray-100 text-gray-700";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${styles}`}
      >
        {status}
      </span>

      {userRole === "admin" && onStatusChange && (
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">
            Update status
          </span>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
