
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/sessions";

export default function Navbar() {
  const [session, setSession] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, []);

  // Close mobile menu after selecting a link
  function closeMenu() {
    setMenuOpen(false);
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
          <span className="brand-name">
            Shegger-Wheels
          </span>
        </Link>

        {/* Hamburger button */}
        <button
          type="button"
          className={`menu-toggle ${menuOpen ? "active" : ""}`}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="main-nav-links"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation links */}
        <div
          id="main-nav-links"
          className={`nav-links ${menuOpen ? "open" : ""}`}
        >
          <Link href="/home" onClick={closeMenu}>
            Home
          </Link>

          <Link href="/cars" onClick={closeMenu}>
            Find a car
          </Link>

          <Link href="/bookings" onClick={closeMenu}>
            My-Booking
          </Link>

          <Link href="/cars#how-it-works" onClick={closeMenu}>
            How it works
          </Link>

          {session?.role === "owner" && (
            <Link href="/owner/cars/new" onClick={closeMenu}>
              List your car
            </Link>
          )}

          <Link href="/disputes" onClick={closeMenu}>
            My Disputes
          </Link>
        </div>

        {/* Navigation actions */}
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

              <Link
                href="/signout"
                className="signin-link"
              >
                SignOut
              </Link>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
