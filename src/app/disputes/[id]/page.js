"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";
import {
  getDisputeById,
  getDisputesForUser,
  updateDispute,
  DISPUTE_STATUSES,
} from "@/lib/disputeStorage";
import { STATUS_STYLES } from "@/components/disputes/dispute-card";

export default function DisputeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState(null);
  const [dispute, setDispute] = useState(null);
  const [statusDraft, setStatusDraft] = useState("Open");
  const [resolutionDraft, setResolutionDraft] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusError, setStatusError] = useState("");
  const [ready, setReady] = useState(false);

  const refreshDispute = useCallback(() => {
    const session = getSession();

    if (!session) {
      router.replace(
        `/signin?next=${encodeURIComponent(`/disputes/${id}`)}`
      );
      return;
    }

    setCurrentUser(session);

    const visibleDisputes = getDisputesForUser(session);
    const isAllowed = visibleDisputes.some(
      (item) => String(item.id) === String(id)
    );

    if (!isAllowed) {
      setDispute(null);
      setReady(true);
      return;
    }

    const found = getDisputeById(id);

    if (!found) {
      setDispute(null);
      setReady(true);
      return;
    }

    setDispute(found);
    setStatusDraft(found.status);
    setResolutionDraft(found.resolution || "");
    setReady(true);
  }, [id, router]);

  useEffect(() => {
    refreshDispute();

    window.addEventListener("disputes-updated", refreshDispute);
    window.addEventListener("storage", refreshDispute);

    return () => {
      window.removeEventListener("disputes-updated", refreshDispute);
      window.removeEventListener("storage", refreshDispute);
    };
  }, [refreshDispute]);

  function handleStatusUpdate(e) {
    e.preventDefault();
    setStatusMessage("");
    setStatusError("");

    if (currentUser?.role !== "admin") {
      setStatusError("Only admins can update dispute status.");
      return;
    }

    try {
      const updated = updateDispute(
        dispute.id,
        {
          status: statusDraft,
          resolution: resolutionDraft.trim(),
        },
        currentUser
      );

      setDispute(updated);
      setStatusDraft(updated.status);
      setResolutionDraft(updated.resolution || "");
      setStatusMessage("Dispute status updated successfully.");
    } catch (error) {
      setStatusError(
        error.message || "Unable to update dispute status."
      );
    }
  }

  if (!ready) {
    return <main className="p-6">Loading dispute...</main>;
  }

  if (!dispute) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold">Dispute not found</h1>
        <p className="mt-2 text-gray-600">
          This dispute does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/disputes"
          className="mt-5 inline-flex min-h-11 items-center text-blue-600"
        >
          Back to Disputes
        </Link>
      </main>
    );
  }

  const statusClass =
    STATUS_STYLES[dispute.status] || STATUS_STYLES.Open;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/disputes" className="text-sm font-medium text-blue-600">
        ← Back to Disputes
      </Link>

      <section className="mt-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="break-words text-2xl font-bold">
              {dispute.subject}
            </h1>
            <p className="mt-2 break-all text-sm text-gray-500">
              Dispute ID: {dispute.id}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClass}`}
          >
            {dispute.status}
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{dispute.category}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Raised by</p>
            <p className="font-medium">{dispute.raisedByRole}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Booking ID</p>
            <p className="break-all font-medium">
              {dispute.bookingId || "Not linked"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Car ID</p>
            <p className="break-all font-medium">
              {dispute.carId || "Not linked"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="font-medium">
              {new Date(dispute.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="font-medium">
              {new Date(dispute.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-5">
          <h2 className="font-semibold">Description</h2>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">
            {dispute.description}
          </p>
        </div>

        <div className="mt-6 border-t pt-5">
          <h2 className="font-semibold">Resolution / Admin Notes</h2>
          <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">
            {dispute.resolution || "No resolution has been added yet."}
          </p>
        </div>

        {currentUser?.role === "admin" && (
          <form
            onSubmit={handleStatusUpdate}
            className="mt-6 space-y-4 border-t pt-5"
          >
            <h2 className="text-lg font-semibold">
              Manage Dispute Status
            </h2>

            <div>
              <label
                htmlFor="disputeStatus"
                className="mb-2 block text-sm font-medium"
              >
                Status
              </label>

              <select
                id="disputeStatus"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                {DISPUTE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="resolution"
                className="mb-2 block text-sm font-medium"
              >
                Resolution or next steps
              </label>

              <textarea
                id="resolution"
                rows={4}
                maxLength={3000}
                value={resolutionDraft}
                onChange={(e) => setResolutionDraft(e.target.value)}
                placeholder="Record the decision or explain what response is needed."
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            {statusMessage && (
              <p role="status" className="text-sm text-green-700">
                {statusMessage}
              </p>
            )}

            {statusError && (
              <p role="alert" className="text-sm text-red-600">
                {statusError}
              </p>
            )}

            <button
              type="submit"
              className="min-h-11 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Status
            </button>
          </form>
        )}
      </section>
    </main>
  );
}