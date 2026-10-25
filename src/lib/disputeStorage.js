const DISPUTES_KEY = "rental_disputes";

export const DISPUTE_STATUSES = [
  "Open",
  "Under Review",
  "Awaiting Response",
  "Resolved",
  "Closed",
];

export function getDisputes() {
  if (typeof window === "undefined") return [];

  try {
    const data = JSON.parse(
      localStorage.getItem(DISPUTES_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveDisputes(disputes) {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  if (!Array.isArray(disputes)) {
    throw new Error("Disputes must be an array.");
  }

  localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));

  // Notify components in the same browser tab.
  window.dispatchEvent(new Event("disputes-updated"));
}

export function createDispute({
  bookingId = null,
  carId = null,
  raisedBy,
  raisedByRole,
  category,
  subject,
  description,
}) {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  if (!raisedBy || !["renter", "owner"].includes(raisedByRole)) {
    throw new Error("A valid renter or owner is required.");
  }

  if (
    !category?.trim() ||
    !subject?.trim() ||
    !description?.trim()
  ) {
    throw new Error("Category, subject, and description are required.");
  }

  const now = new Date().toISOString();

  const dispute = {
    id: crypto.randomUUID(),
    bookingId,
    carId,
    raisedBy,
    raisedByRole,
    category: category.trim(),
    subject: subject.trim(),
    description: description.trim(),
    status: "Open",
    resolution: "",
    createdAt: now,
    updatedAt: now,
  };

  saveDisputes([dispute, ...getDisputes()]);

  return dispute;
}

export function getDisputeById(id) {
  return (
    getDisputes().find(
      (item) => String(item.id) === String(id)
    ) ?? null
  );
}

export function getDisputesForUser(user) {
  if (!user?.id) return [];

  const disputes = getDisputes();

  if (user.role === "admin") return disputes;

  return disputes.filter(
    (item) => String(item.raisedBy) === String(user.id)
  );
}

export function updateDispute(id, changes, currentUser) {
  if (currentUser?.role !== "admin") {
    throw new Error("Only an admin can update disputes.");
  }

  const allowedFields = ["status", "resolution"];

  if (
    !changes ||
    Object.keys(changes).length === 0 ||
    Object.keys(changes).some(
      (key) => !allowedFields.includes(key)
    )
  ) {
    throw new Error("Invalid dispute update.");
  }

  if (
    changes.status !== undefined &&
    !DISPUTE_STATUSES.includes(changes.status)
  ) {
    throw new Error("Invalid dispute status.");
  }

  if (
    changes.resolution !== undefined &&
    typeof changes.resolution !== "string"
  ) {
    throw new Error("Resolution must be text.");
  }

  const disputes = getDisputes();

  const index = disputes.findIndex(
    (item) => String(item.id) === String(id)
  );

  if (index === -1) {
    throw new Error("Dispute not found.");
  }

  const updatedDispute = {
    ...disputes[index],
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  disputes[index] = updatedDispute;
  saveDisputes(disputes);

  return updatedDispute;
}