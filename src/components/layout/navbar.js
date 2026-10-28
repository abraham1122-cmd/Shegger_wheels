
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/sessions";

export default function Navbar() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Shegger-Wheels home">
          <span className="brand-mark">Sw</span>
          <span className="brand-name">
            Shegger-Wheels
            
          </span>
        </Link>

        <div className="nav-links">
          <Link href="/home">Home</Link>
          <Link href="/cars">Find a car</Link>
          <Link href="/bookings">My-Booking</Link>
          <Link href="/cars#how-it-works">How it works</Link>

          {session?.role === "owner" && (
            <Link href="/owner/cars/new">List your car</Link>
          )}

          <Link href="/disputes" className="">My Disputes</Link>
        </div>

        <div className="nav-actions">
          {!session ? (
            <>
              <Link href="/signin" className="signin-link">
                Sign in
              </Link>

              <Link href="/admin" className="">Admin</Link>
              <Link
                href="/signUp"
                className="button button-primary nav-cta"
              >
                Get started <span></span>
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
