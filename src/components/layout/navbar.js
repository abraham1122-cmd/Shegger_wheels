"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/sessions";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSession(getSession());
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleMyBookings() {
    closeMenu();

    const currentSession = getSession();

    if (!currentSession) {
      router.push("/signin?next=/bookings");
      return;
    }

    if (currentSession.role !== "renter") {
      router.push("/signin?next=/bookings");
      return;
    }

    router.push("/bookings");
  }

  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">

        <Link
          href="/"
          className="brand"
          aria-label="Shegger-Wheels home"
          onClick={closeMenu}
        >
          <span className="brand-mark">Sw</span>
          <span className="brand-name">Shegger-Wheels</span>
        </Link>

        {/* Hamburger button */}
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

        {/* Navigation links */}
        <div
          id="main-nav-links"
          className={`nav-links ${menuOpen ? "open" : ""}`}
        >
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/cars" onClick={closeMenu}>
            Find a car
          </Link>

         
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

          {session?.role === "owner" && (
            <Link href="/owner/cars/new" onClick={closeMenu}>
              List your car
            </Link>
          )}
        </div>

        <Link href="/my_dashboard" className="">
             
             Dashboard
        
        </Link>

       
        <div className="nav-actions">
          {!session ? (
            <>
              <Link href="/signin" className="signin-link">
                Sign in
              </Link>

              <Link href="/admin">
                Admin
              </Link>

              <Link
                href="/signUp"
                className="button button-primary nav-cta"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <span className="signin-link">
                {session.name}
              </span>

              <Link href="/signout" className="signin-link">
                Sign Out
              </Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}