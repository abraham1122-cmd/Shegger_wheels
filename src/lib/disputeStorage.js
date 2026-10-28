
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

  localStorage.setItem(
    DISPUTES_KEY,
    JSON.stringify(disputes)
  );

  window.dispatchEvent(new Event("disputes-updated"));
}


export function createDispute({
  bookingId = null,
  carId = null,
  renterId,
  ownerId,
  raisedBy,
  raisedByRole,
  category,
  subject,
  description,
}) {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  if (
    renterId == null ||
    ownerId == null ||
    !["renter", "owner"].includes(raisedByRole) ||
    raisedBy == null
  ) {
    throw new Error(
      "Valid renter, owner, and reporting user are required."
    );
  }

  if (
    !category?.trim() ||
    !subject?.trim() ||
    !description?.trim()
  ) {
    throw new Error(
      "Category, subject, and description are required."
    );
  }

  if (
    (raisedByRole === "renter" &&
      String(raisedBy) !== String(renterId)) ||
    (raisedByRole === "owner" &&
      String(raisedBy) !== String(ownerId))
  ) {
    throw new Error(
      "The reporting user does not match the dispute participants."
    );
  }

  const now = new Date().toISOString();

  const dispute = {
    id: crypto.randomUUID(),
    bookingId,
    carId,

    renterId,
    ownerId,

    raisedBy,
    raisedByRole,

    category: category.trim(),
    subject: subject.trim(),
    description: description.trim(),

    renterEvidence: [],
    ownerEvidence: [],

    ownerResponse: "",
    adminDecision: null,
    adminNote: "",

    status: "Open",
    resolution: "",

    createdAt: now,
    updatedAt: now,
  };

  saveDisputes([dispute, ...getDisputes()]);

  return dispute;
}


export function getDisputeById(id) {
  if (id == null) return null;

  return (
    getDisputes().find(
      (item) => String(item.id) === String(id)
    ) ?? null
  );
}


export function getDisputesForUser(user) {
  if (user?.id == null || !user?.role) {
    return [];
  }

  const disputes = getDisputes();

  if (user.role === "admin") {
    return disputes;
  }

  if (user.role === "renter") {
    return disputes.filter(
      (item) =>
        String(item.renterId) === String(user.id)
    );
  }

  if (user.role === "owner") {
    return disputes.filter(
      (item) =>
        String(item.ownerId) === String(user.id)
    );
  }

  return [];
}


export function addDisputeMessage(id, message, currentUser) {
  if (typeof window === "undefined") {
    throw new Error("Browser storage is unavailable.");
  }

  if (!currentUser?.id || !["renter", "owner", "admin"].includes(currentUser.role)) {
    throw new Error("You are not authorized to reply.");
  }

  const text = String(message ?? "").trim();

  if (!text) {
    throw new Error("Please enter a reply.");
  }

  const disputes = getDisputes();
  const index = disputes.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("Dispute not found.");
  }

  const dispute = disputes[index];

  const isAdmin = currentUser.role === "admin";
  const isRenter =
    currentUser.role === "renter" &&
    dispute.renterId === currentUser.id;
  const isOwner =
    currentUser.role === "owner" &&
    dispute.ownerId === currentUser.id;

  if (!isAdmin && !isRenter && !isOwner) {
    throw new Error("You cannot reply to this dispute.");
  }

  if (["Resolved", "Closed"].includes(dispute.status)) {
    throw new Error("This dispute is closed to new replies.");
  }

  const now = new Date().toISOString();

  const newMessage = {
    id: crypto.randomUUID(),
    senderId: currentUser.id,
    senderRole: currentUser.role,
    message: text,
    createdAt: now,
  };

  disputes[index] = {
    ...dispute,
    messages: [...(dispute.messages || []), newMessage],
    updatedAt: now,
  };

  saveDisputes(disputes);

  return newMessage;
}




export function updateDispute(id, changes, currentUser) {
  if (currentUser?.role !== "admin") {
    throw new Error("Only an admin can update disputes.");
  }

  const allowedFields = [
    "status",
    "resolution",
    "adminDecision",
    "adminNote",
  ];

  if (
    !changes ||
    typeof changes !== "object" ||
    Array.isArray(changes) ||
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

  if (
    changes.adminNote !== undefined &&
    typeof changes.adminNote !== "string"
  ) {
    throw new Error("Admin note must be text.");
  }

  if (
    changes.adminDecision !== undefined &&
    changes.adminDecision !== null &&
    typeof changes.adminDecision !== "string"
  ) {
    throw new Error("Admin decision must be text.");
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
