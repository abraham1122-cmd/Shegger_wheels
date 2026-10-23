


const BOOKINGS_KEY = "rental_bookings";

const NON_BLOCKING_STATUSES = [
  "cancelled",
  "canceled",
  "rejected",
  "declined",
  "failed",
  "refunded",
];

function getDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function checkCarAvailability(
  carId,
  pickUpDate,
  returnDate
) {
  if (typeof window === "undefined") {
    return {
      available: false,
      message: "Availability can only be checked in your browser.",
    };
  }

  if (!carId || !pickUpDate || !returnDate) {
    return {
      available: false,
      message: "Please select a car and both dates.",
    };
  }

  if (returnDate <= pickUpDate) {
    return {
      available: false,
      message: "Return date must be after pickup date.",
    };
  }

  let bookings = [];

  try {
    const saved = JSON.parse(
      localStorage.getItem(BOOKINGS_KEY) || "[]"
    );

    bookings = Array.isArray(saved) ? saved : [];
  } catch {
    return {
      available: false,
      message: "Could not read booking history.",
    };
  }

  const conflict = bookings.find((booking) => {
    const bookingCarId =
      booking.carId ?? booking.car?.id ?? booking.vehicleId;

    if (String(bookingCarId) !== String(carId)) {
      return false;
    }

    const status = String(booking.status || "pending")
      .trim()
      .toLowerCase();

    if (NON_BLOCKING_STATUSES.includes(status)) {
      return false;
    }

    const existingPickup = getDateOnly(
      booking.pickUpDate ??
      booking.startDate ??
      booking.fromDate
    );

    const existingReturn = getDateOnly(
      booking.returnDate ??
      booking.endDate ??
      booking.toDate
    );

    if (!existingPickup || !existingReturn) {
      return false;
    }

    // Overlap exists if the requested stay starts before
    // the existing booking ends AND ends after it starts.
    return (
      pickUpDate < existingReturn &&
      returnDate > existingPickup
    );
  });

  if (conflict) {
    return {
      available: false,
      message:
        "This car is already booked for some or all of those dates. Please choose different dates.",
    };
  }

  return {
    available: true,
    message: "This car is available for your selected dates.",
  };
}
