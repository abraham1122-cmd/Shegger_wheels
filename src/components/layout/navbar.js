
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSession } from "@/lib/sessions";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function updateSession() {
      setSession(getSession());
    }

    // Check the current signed-in user
    updateSession();

    // Update when storage changes in another tab
    window.addEventListener("storage", updateSession);

    // Update when the user returns to this tab
    window.addEventListener("focus", updateSession);

    // Update after navigation
    return () => {
      window.removeEventListener("storage", updateSession);
      window.removeEventListener("focus", updateSession);
    };
  }, [pathname]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleMyBookings(e) {
    e.preventDefault();
    closeMenu();

    const currentSession = getSession();

    if (!currentSession) {
      router.push("/signin?next=%2Fbookings");
      return;
    }

    if (currentSession.role !== "renter") {
      router.push("/my-dashboard");
      return;
    }

    router.push("/bookings");
  }

  function handleDashboard() {
    closeMenu();

    const currentSession = getSession();

    if (!currentSession) {
      router.push("/signin?next=%2Fmy-dashboard");
      return;
    }

    switch (currentSession.role) {
      case "renter":
        router.push("/dashboard");
        break;

      case "owner":
        router.push("/owner/dashboard");
        break;

      case "admin":
        router.push("/admin");
        break;

      default:
        router.push("/signin");
    }
  }

  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">

        <Link href="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark">Sw</span>
          <span className="brand-name">Shegger-Wheels</span>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-nav-links"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          id="main-nav-links"
          className={`nav-links ${menuOpen ? "open" : ""}`}
        >
          <Link href="/" onClick={closeMenu}>Home</Link>

          <Link href="/cars" onClick={closeMenu}>Find a car</Link>

          <Link
            href="/bookings"
            className="nav-bookings-link"
            onClick={handleMyBookings}
          >
            My Bookings
          </Link>

          <Link href="/cars#how-it-works" onClick={closeMenu}>
            How it works
          </Link>

          {session && (
            <button
              type="button"
              className="nav-dashboard-link"
              onClick={handleDashboard}
            >
              Dashboard
            </button>
          )}

          {session?.role === "owner" && (
            <Link href="/owner/cars/new" onClick={closeMenu}>
              List your car
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {!session ? (
            <>
              <Link href="/signin" className="signin-link">
                Sign in
              </Link>

              {/* <Link href="/admin" className="admin-link">
                Admin
              </Link> */}

              <Link href="/signin" className="button button-primary nav-cta">
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="signin-link session-name">
                {session.name} ({session.role})
              </span>

              <Link
                href="/signout"
                className="signin-link signout-link"
                onClick={closeMenu}
              >
                Sign Out
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
