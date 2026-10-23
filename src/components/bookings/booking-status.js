
const BOOKINGS_KEY = "rental_bookings";

export const BOOKING_STATUSES = [
  "Pending",
  "Under Review",
  "Accepted",
  "Approved",
  "Rejected",
  "Cancelled",
];

export function getBookings() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(BOOKINGS_KEY) || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Save the complete bookings array.
export function saveBookings(bookings) {
  if (typeof window === "undefined") {
    throw new Error("Bookings can only be saved in the browser.");
  }

  if (!Array.isArray(bookings)) {
    throw new Error("Bookings must be an array.");
  }

  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

// Give each booking a unique ID if it doesn't already have one.
// Existing duplicate IDs are repaired too.
export function repairBookingIds() {
  const bookings = getBookings();
  const seenIds = new Set();

  const repairedBookings = bookings.map((booking) => {
    let id = booking.id == null ? "" : String(booking.id).trim();

    if (!id || seenIds.has(id)) {
      id = crypto.randomUUID();
    }

    seenIds.add(id);

    return { ...booking, id };
  });

  saveBookings(repairedBookings);
  return repairedBookings;
}

export function updateBookingStatus(bookingId, newStatus) {
  if (
    bookingId == null ||
    String(bookingId).trim() === ""
  ) {
    throw new Error("Booking ID is missing.");
  }

  if (!BOOKING_STATUSES.includes(newStatus)) {
    throw new Error("Invalid booking status.");
  }

  const bookings = getBookings();
  const matchingIndexes = [];

  bookings.forEach((booking, index) => {
    if (
      booking.id != null &&
      String(booking.id) === String(bookingId)
    ) {
      matchingIndexes.push(index);
    }
  });

  if (matchingIndexes.length === 0) {
    throw new Error("Booking not found.");
  }

  if (matchingIndexes.length > 1) {
    throw new Error(
      "Duplicate booking IDs found. Repair booking IDs first."
    );
  }

  const index = matchingIndexes[0];
  const updatedBookings = [...bookings];

  updatedBookings[index] = {
    ...updatedBookings[index],
    status: newStatus,
  };

  saveBookings(updatedBookings);
  return updatedBookings;
}
