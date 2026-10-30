
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, isSignedIn } from "@/lib/sessions";

function getBookingStatus(booking) {
  return String(booking.status || "Pending").toLowerCase();
}

function formatMoney(value) {
  return `ETB ${Number(value || 0).toLocaleString("en-US")}`;
}

function getRenterBookings() {
  const session = getSession();

  if (!session?.id) {
    return [];
  }

  const saved = JSON.parse(
    localStorage.getItem("rental_bookings") || "[]"
  );

  const allBookings = Array.isArray(saved) ? saved : [];

  return allBookings.filter((booking) => {
    const renterId =
      booking.renterId ??
      booking.userId ??
      booking.customerId;

    return (
      renterId != null &&
      String(renterId) === String(session.id)
    );
  });
}

export default function RenterDashboardPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renterName, setRenterName] = useState("Renter");

  const loadDashboard = useCallback(() => {
    try {
      const session = getSession();

      if (!session?.id) {
        setBookings([]);
        return;
      }

      setRenterName(
        session.name ||
        session.fullName ||
        session.firstName ||
        "Renter"
      );

      setBookings(getRenterBookings());
    } catch (error) {
      console.error("Unable to load renter dashboard:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/signin?next=%2Fdashboard");
      return;
    }

    loadDashboard();

    function handleStorageChange(event) {
      if (
        event.key === "rental_bookings" ||
        event.key === null
      ) {
        loadDashboard();
      }
    }

    function handleFocus() {
      loadDashboard();
    }

    function handleBookingUpdate() {
      loadDashboard();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener(
      "rental-bookings-updated",
      handleBookingUpdate
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener(
        "rental-bookings-updated",
        handleBookingUpdate
      );
    };
  }, [router, loadDashboard]);


  const totalBookings = bookings.length;

 
  const activeBookings = bookings.filter((booking) =>
    ["accepted", "approved", "confirmed", "active"].includes(
      getBookingStatus(booking)
    )
  ).length;

 
  const pendingBookings = bookings.filter((booking) =>
    ["pending", "under review"].includes(
      getBookingStatus(booking)
    )
  ).length;


  const completedBookings = bookings.filter(
    (booking) => getBookingStatus(booking) === "completed"
  ).length;

 
  const totalSpent = bookings
    .filter((booking) => {
      const status = getBookingStatus(booking);

      const paymentStatus = String(
        booking.paymentStatus || ""
      ).toLowerCase();

      return (
        status !== "cancelled" &&
        paymentStatus === "paid"
      );
    })
    .reduce((total, booking) => {
      const amount = Number(booking.totalPrice);

      return (
        total +
        (Number.isFinite(amount) && amount > 0 ? amount : 0)
      );
    }, 0);


  const recentBookings = [...bookings]
    .reverse()
    .slice(0, 5);


  const cancelledBookings = bookings.filter(
    (booking) => getBookingStatus(booking) === "cancelled"
  ).length;

  if (loading) {
    return (
      <p className="dashboard-loading">
        Loading dashboard...
      </p>
    );
  }

  return (
    <div className="renter-overview">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            YOUR RENTAL ACCOUNT
          </span>

          <h2 id="wel">Welcome back! {renterName}</h2>

          <p>
            Manage your bookings and keep track of your rental activity.
          </p>
        </div>

        <Link href="/cars" className="dashboard-primary-button">
          Explore Cars
        </Link>
      </section>

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <div className="stat-icon bookings-icon"></div>

          <div>
            <p>Total Bookings</p>
            <h2>{totalBookings}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon active-icon"></div>

          <div>
            <p>Active Bookings</p>
            <h2>{activeBookings}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card">
          <div className="stat-icon pending-icon"></div>

          <div>
            <p>Pending Requests</p>
            <h2>{pendingBookings}</h2>
          </div>
        </article>

        <article className="dashboard-stat-card spending-card">
          <div className="stat-icon spending-icon">
            ETB
          </div>

          <div>
            <p>Total Spent</p>
            <h2>{formatMoney(totalSpent)}</h2>
            <span>Paid bookings only</span>
          </div>
        </article>
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-panel recent-bookings-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Bookings</h2>
              <p>Your latest rental reservations</p>
            </div>

            <Link href="/bookings">
              View all 
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="dashboard-empty-state">
              <div className="empty-icon"></div>

              <h3>No bookings yet</h3>

              <p>
                Your bookings will appear here after you make a reservation.
              </p>

              <Link href="/cars">Find a car</Link>
            </div>
          ) : (
            <div className="recent-bookings-list">
              {recentBookings.map((booking, index) => {
                const status = booking.status || "Pending";

                const statusClass = String(status)
                  .toLowerCase()
                  .replace(/\s+/g, "-");

                return (
                  <article
                    className="recent-booking-item"
                    key={booking.id || `${booking.carId}-${index}`}
                  >
                    <div className="recent-booking-car-icon"></div>

                    <div className="recent-booking-info">
                      <h3>{booking.carName || "Rental car"}</h3>

                      <p>
                        {booking.pickUpDate || "Pickup date unavailable"}
                      </p>
                    </div>

                    <div className="recent-booking-right">
                      <strong>
                        {formatMoney(booking.totalPrice)}
                      </strong>

                      <span
                        className={`dashboard-status ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-side-panels">
          <section className="dashboard-panel activity-panel">
            <h2>Booking Summary</h2>

            <div className="summary-row">
              <span>Completed bookings</span>
              <strong>{completedBookings}</strong>
            </div>

            <div className="summary-row">
              <span>Pending bookings</span>
              <strong>{pendingBookings}</strong>
            </div>

            <div className="summary-row">
              <span>Active bookings</span>
              <strong>{activeBookings}</strong>
            </div>

            <div className="summary-row">
              <span>Cancelled bookings</span>
              <strong>{cancelledBookings}</strong>
            </div>
          </section>

          <section className="dashboard-panel quick-actions-panel">
            <h2>Quick Actions</h2>

            <Link href="/cars">
              <span></span>
              Find a rental car
              <span className="quick-action-arrow"></span>
            </Link>

            <Link href="/bookings">
              <span></span>
              Manage my bookings
              <span className="quick-action-arrow"></span>
            </Link>

            <Link href="/disputes">
              <span></span>
              Report a problem
              <span className="quick-action-arrow"></span>
            </Link>
          </section>
        </div>
      </section>
    </div>
  );
}
