
"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/sessions";
import { useRouter } from "next/navigation";

const CARS_KEY = "rental_cars";
const USERS_KEY = "rental-users";
const BOOKINGS_KEY = "rental_bookings";
const DISPUTES_KEY = "rental_disputes";

const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Active",
  "Completed",
  "Cancelled",
  "Rejected",
];

function readStorage(key) {
  try {
    const value = localStorage.getItem(key);
    const data = value ? JSON.parse(value) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function carStatus(car) {
  const value = String(
    car.approvalStatus ?? car.status ?? "Unspecified"
  ).toLowerCase();

  if (value === "approved") return "Approved";
  if (value === "pending") return "Pending";
  if (value === "rejected") return "Rejected";

  return "Unspecified";
}

function bookingStatus(booking) {
  const value = String(
    booking.bookingStatus ?? booking.status ?? "Pending"
  ).toLowerCase();

  const statuses = {
    pending: "Pending",
    confirmed: "Confirmed",
    approved: "Confirmed",
    active: "Active",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
    rejected: "Rejected",
  };

  return statuses[value] || "Pending";
}

function isOwnerCar(car) {
  return Boolean(
    car.ownerId ||
      car.ownerID ||
      car.ownerEmail ||
      car.owner?.id ||
      car.owner?.email ||
      car.createdBy ||
      car.userId ||
      car.user_id
  );
}

function carName(car) {
  return car.name || car.carName || car.title || "Unnamed car";
}

function money(value) {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function amount(booking) {
  const total =
    booking.totalPrice ??
    booking.totalAmount ??
    booking.amount ??
    booking.total;

  if (total !== undefined && total !== null && total !== "") {
    return Number(total) || 0;
  }

  const dailyPrice = Number(
    booking.pricePerDay ?? booking.dailyRate ?? booking.price ?? 0
  );

  const days = Number(
    booking.rentalDays ?? booking.numberOfDays ?? booking.days ?? 1
  );

  return dailyPrice * days;
}

function downloadCSV(filename, rows) {
  if (!rows.length) {
    window.alert("There is no data to export.");
    return;
  }

  const headers = Object.keys(rows[0]);
  const escapeValue = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.map(escapeValue).join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeValue(row[header])).join(",")
    ),
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

function StatCard({ title, value, description }) {
  return (
    <article className="dashboard-stat-card">
      <p className="dashboard-stat-title">{title}</p>
      <p className="dashboard-stat-value">{value}</p>

      {description && (
        <p className="dashboard-stat-description">{description}</p>
      )}
    </article>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);

  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [bookingFilter, setBookingFilter] = useState("All");

  const refresh = useCallback(() => {
    setCars(readStorage(CARS_KEY));
    setUsers(readStorage(USERS_KEY));
    setBookings(readStorage(BOOKINGS_KEY));
    setDisputes(readStorage(DISPUTES_KEY));
  }, []);

  useEffect(() => {
    const session = getSession();

    if (!session || session.role !== "admin") {
      router.replace("/signin?next=/admin");
      setLoading(false);
      return;
    }

    setAuthorized(true);
    refresh();
    setLoading(false);
  }, [router, refresh]);

  useEffect(() => {
    if (!authorized) return;

    const handleStorage = (event) => {
      if (
        !event.key ||
        [CARS_KEY, USERS_KEY, BOOKINGS_KEY, DISPUTES_KEY].includes(
          event.key
        )
      ) {
        refresh();
      }
    };

    const handleUpdate = () => refresh();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cars-updated", handleUpdate);
    window.addEventListener("users-updated", handleUpdate);
    window.addEventListener("bookings-updated", handleUpdate);
    window.addEventListener("disputes-updated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cars-updated", handleUpdate);
      window.removeEventListener("users-updated", handleUpdate);
      window.removeEventListener("bookings-updated", handleUpdate);
      window.removeEventListener("disputes-updated", handleUpdate);
    };
  }, [authorized, refresh]);

  const ownerCars = cars.filter(isOwnerCar);

  const pendingCars = cars.filter(
    (car) => carStatus(car) === "Pending"
  );

  const approvedCars = cars.filter(
    (car) => carStatus(car) === "Approved"
  );

  const rejectedCars = cars.filter(
    (car) => carStatus(car) === "Rejected"
  );



  const activeOwners = users.filter((owner) => {
  
  if (owner.role !== "owner") {
    return false;
  }

  
  if (owner.isActive === false || owner.active === false) {
    return false;
  }

  
  const lastLogin = Date.parse(owner.lastLoginAt || "");
  const thirtyDaysAgo =
    Date.now() - 30 * 24 * 60 * 60 * 1000;

  return (
    Number.isFinite(lastLogin) &&
    lastLogin >= thirtyDaysAgo
  );
});



  const activeUsers = users.filter((user) => {
    if (user.isActive === false || user.active === false) {
      return false;
    }

    const lastLogin = Date.parse(user.lastLoginAt || "");
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return Number.isFinite(lastLogin) && lastLogin >= thirtyDaysAgo;
  });

  const completedBookings = bookings.filter(
    (booking) => bookingStatus(booking) === "Completed"
  );

  const platformFee = completedBookings.reduce(
    (total, booking) => total + amount(booking) * 0.1,
    0
  );


const monthlyBookings = Array.from({ length: 6 }, (_, index) => {
  const date = new Date(2026, 9, 1); 
  date.setMonth(date.getMonth() - (5 - index));

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString("en", { month: "short" }),
      count: 0,
    };
  });

  bookings.forEach((booking) => {
    const dateValue =
      booking.createdAt ??
      booking.created_at ??
      booking.bookingDate ??
      booking.date;

    if (!dateValue) return;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return;

    const month = monthlyBookings.find(
      (item) =>
        item.year === date.getFullYear() &&
        item.month === date.getMonth()
    );

    if (month) month.count += 1;
  });

  const filteredCars = ownerCars.filter((car) => {
    const matchesStatus =
      statusFilter === "All" || carStatus(car) === statusFilter;

    const searchText = [
      carName(car),
      car.id,
      car.ownerId,
      car.ownerEmail,
      car.make,
      car.model,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && searchText.includes(search.toLowerCase());
  });

  const filteredBookings = bookings.filter(
    (booking) =>
      bookingFilter === "All" ||
      bookingStatus(booking) === bookingFilter
  );

  function updateCarStatus(carId, approvalStatus) {
    const session = getSession();

    if (!session || session.role !== "admin") {
      router.replace("/signin?next=/admin");
      return;
    }

    const savedCars = readStorage(CARS_KEY);

    const selectedCar = savedCars.find(
      (car) => String(car.id) === String(carId)
    );

    if (!selectedCar) {
      setNotice("Car not found in rental_cars.");
      return;
    }

    if (!isOwnerCar(selectedCar)) {
      setNotice("Only owner-added cars can be reviewed here.");
      return;
    }

    const updatedCars = savedCars.map((car) =>
      String(car.id) === String(carId)
        ? {
            ...car,
            approvalStatus,
            reviewedAt: new Date().toISOString(),
          }
        : car
    );

    localStorage.setItem(CARS_KEY, JSON.stringify(updatedCars));
    setCars(updatedCars);
    window.dispatchEvent(new Event("cars-updated"));

    setNotice(`${carName(selectedCar)}: ${approvalStatus}.`);
  }

  function exportCars() {
    downloadCSV(
      "cars-report.csv",
      cars.map((car) => ({
        id: car.id ?? "",
        name: carName(car),
        owner: car.ownerId ?? car.ownerEmail ?? car.createdBy ?? "",
        source: isOwnerCar(car) ? "Owner-added" : "Seed car",
        approvalStatus: carStatus(car),
        pricePerDay: car.pricePerDay ?? car.dailyRate ?? car.price ?? "",
      }))
    );
  }

  function exportBookings() {
    downloadCSV(
      "bookings-report.csv",
      bookings.map((booking) => ({
        id: booking.id ?? booking.bookingId ?? "",
        carId: booking.carId ?? "",
        renterId: booking.renterId ?? booking.userId ?? "",
        status: bookingStatus(booking),
        amount: amount(booking),
        estimatedPlatformFee:
          bookingStatus(booking) === "Completed"
            ? amount(booking) * 0.1
            : 0,
        date:
          booking.createdAt ??
          booking.created_at ??
          booking.bookingDate ??
          booking.date ??
          "",
      }))
    );
  }

  function exportUsers() {
    downloadCSV(
      "users-report.csv",
      users.map((user) => ({
        id: user.id ?? user.userId ?? "",
        name: user.name ?? user.fullName ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        lastLoginAt: user.lastLoginAt ?? "",
      }))
    );
  }

  function exportDisputes() {
    downloadCSV(
      "disputes-report.csv",
      disputes.map((dispute) => ({
        id: dispute.id ?? "",
        subject: dispute.subject ?? "",
        bookingId: dispute.bookingId ?? "",
        status: dispute.status ?? "",
        createdAt: dispute.createdAt ?? "",
      }))
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading...
      </div>
    );
  }

  if (!authorized) return null;

  const maximumBookings = Math.max(
    ...monthlyBookings.map((month) => month.count),
    1
  );

  return (
    <main className="admin-dashboard">
      <section className="dashboard-heading">
        <div>
          
          <p>Managing car rental marketplace.</p>
        </div>

        <button className="button button-outline" onClick={refresh}>
          Refresh
        </button>
      </section>

      {notice && (
        <div className="dashboard-notice">
          <span>{notice}</span>
          <button
            className="notice-dismiss"
            onClick={() => setNotice("")}
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="dashboard-stats-grid">
        <StatCard title="Total Users" value={users.length} />

           <StatCard
           title="Active Owners"
           value={activeOwners.length}
           description="Owners was active las 30 days"
           />


        <StatCard
          title="Active Renter"
          value={activeUsers.length}
          description="Signed in during the last 30 days"
        />
        <StatCard
          title="Total Cars"
          value={cars.length}
          description="All cars from rental_cars"
        />
        <StatCard title="Total Bookings" value={bookings.length} />
      </section>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Car Inventory</h2>

        <div className="dashboard-stats-grid">
          <StatCard title="Owner-Added Cars" value={ownerCars.length} />
          <StatCard title="Pending Cars" value={pendingCars.length} />
          <StatCard title="Approved Cars" value={approvedCars.length} />
          <StatCard title="Rejected Cars" value={rejectedCars.length} />
        </div>
      </section>

      <section className="dashboard-stats-grid dashboard-fee-grid">
        <StatCard
          title="Completed Bookings"
          value={completedBookings.length}
        />
        <StatCard
          title="Estimated Platform Fee"
          value={money(platformFee)}
          description="10% fee on completed bookings"
        />
      </section>

      <section className="dashboard-panel">
        <h2 className="dashboard-section-title">
          Monthly Booking Volume
        </h2>

        <div className="booking-chart">
          {monthlyBookings.map((month) => {
            const height = (month.count / maximumBookings) * 100;

            return (
              <div
                className="booking-chart-column"
                key={`${month.year}-${month.month}`}
              >
                <span className="booking-chart-count">
                  {month.count}
                </span>

                <div className="booking-chart-bar-area">
                  <div
                    className="booking-chart-bar"
                    style={{
                      height: `${height}%`,
                      minHeight: month.count ? "6px" : "0",
                    }}
                  />
                </div>

                <span className="booking-chart-label">
                  {month.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="cars" className="dashboard-panel dashboard-anchor">
        <div className="panel-heading">
          <div>
            <h2 className="dashboard-section-title">
              Manage Owner Cars
            </h2>
            <p className="panel-description">
              Approve or reject owner submissions stored in rental_cars.
            </p>
          </div>

          <button className="button button-dark" onClick={exportCars}>
            Export Cars CSV
          </button>
        </div>

        <div className="dashboard-filters">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search cars or owners"
            aria-label="Search cars or owners"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter cars by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Unspecified">Unspecified</option>
          </select>
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table cars-table">
            <thead>
              <tr>
                <th>Car</th>
                <th>Owner</th>
                <th>Daily Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCars.map((car, index) => (
                <tr key={car.id ?? index}>
                  <td>
                    <strong>{carName(car)}</strong>
                    <span className="table-secondary">
                      ID: {car.id ?? "Missing ID"}
                    </span>
                  </td>

                  <td>
                    {car.ownerId ??
                      car.ownerEmail ??
                      car.owner?.email ??
                      car.createdBy ??
                      car.userId ??
                      "—"}
                  </td>

                  <td>
                    {money(
                      car.pricePerDay ?? car.dailyRate ?? car.price ?? 0
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${carStatus(car).toLowerCase()}`}
                    >
                      {carStatus(car)}
                    </span>
                  </td>

                  <td>
                    {car.id == null ? (
                      <span className="missing-id">Missing car ID</span>
                    ) : (
                      <div className="table-actions">
                        <button
                          className="button button-approve"
                          onClick={() =>
                            updateCarStatus(car.id, "Approved")
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="button button-reject"
                          onClick={() =>
                            updateCarStatus(car.id, "Rejected")
                          }
                        >
                          Reject
                        </button>

                        <button
                          className="button button-reset"
                          onClick={() =>
                            updateCarStatus(car.id, "Pending")
                          }
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCars.length === 0 && (
            <p className="dashboard-empty">
              No owner-added cars match your search. Check that owner-added
              cars contain an owner identifier.
            </p>
          )}
        </div>
      </section>

      <section
        id="bookings"
        className="dashboard-panel dashboard-anchor"
      >
        <div className="panel-heading">
          <div>
            <h2 className="dashboard-section-title">Bookings</h2>
            <p className="panel-description">
              Review current booking records.
            </p>
          </div>

          <button className="button button-dark" onClick={exportBookings}>
            Export Bookings CSV
          </button>
        </div>

        <div className="booking-status-filters">
          {["All", ...BOOKING_STATUSES].map((status) => (
            <button
              key={status}
              className={`filter-button ${
                bookingFilter === status ? "filter-button-active" : ""
              }`}
              onClick={() => setBookingFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="dashboard-table-wrapper">
          <table className="dashboard-table bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Car ID</th>
                <th>Renter ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr
                  key={booking.id ?? booking.bookingId ?? index}
                >
                  <td>{booking.id ?? booking.bookingId ?? "—"}</td>
                  <td>{booking.carId ?? "—"}</td>
                  <td>{booking.renterId ?? booking.userId ?? "—"}</td>
                  <td>{money(amount(booking))}</td>
                  <td>
                    <span
                      className={`status-badge status-${bookingStatus(booking).toLowerCase()}`}
                    >
                      {bookingStatus(booking)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <p className="dashboard-empty">No bookings found.</p>
          )}
        </div>
      </section>

      <section
        id="reports"
        className="dashboard-panel dashboard-anchor"
      >
        <h2 className="dashboard-section-title">
          Reports and Exports
        </h2>

        <p className="panel-description">
          Download reports based on the data saved in your browser.
        </p>

        <div className="report-actions">
          <button className="button button-outline" onClick={exportUsers}>
            Export Users
          </button>
          <button className="button button-outline" onClick={exportCars}>
            Export Cars
          </button>
          <button
            className="button button-outline"
            onClick={exportBookings}
          >
            Export Bookings
          </button>
          <button
            className="button button-outline"
            onClick={exportDisputes}
          >
            Export Disputes
          </button>
        </div>

        <p className="dashboard-footnote">
          {/* Platform fees are illustrative estimates, not actual payments.
          Data is stored in browser localStorage and is not shared across
          different users or devices. */}

     
        </p>
      </section>

      <small className="ad">Shegger Wheels Platform @2026</small>
    </main>
  );
}
