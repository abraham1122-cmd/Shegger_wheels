
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import "./Owner.css";



export default function OwnerLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="owner-layout">
      
      <button
        type="button"
        className={`owner-menu-toggle ${menuOpen ? "active" : ""}`}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="owner-sidebar"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

    
      {menuOpen && (
        <button
          type="button"
          className="owner-menu-overlay"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}

  
      <aside
        id="owner-sidebar"
        className={`owner-sidebar ${menuOpen ? "open" : ""}`}
      >
        <h2>Owner</h2>

        <nav>
          <Link href="/owner" onClick={closeMenu}>
            Dashboard
          </Link>

          <Link href="/owner/cars" onClick={closeMenu}>
            My Cars
          </Link>

          <Link href="/owner/cars/new" onClick={closeMenu}>
            Plus Car
          </Link>

          <Link href="/owner/bookings" onClick={closeMenu}>
            Booking-Request
          </Link>

          <Link href="/owner/earnings" onClick={closeMenu}>
            Earnings
          </Link>

          <Link href="/owner/disputes" onClick={closeMenu}>
            Disputes
          </Link>
        </nav>

        <div className="owner-sidebar-footer">
          <Link
            href="/signout"
            className="owner-signout"
            onClick={closeMenu}
          >
            Sign Out
          </Link>
        </div>
      </aside>

      
      <main className="owner-content">
        <Suspense 
        fallback={<p>loading..</p>}
        >
        {children}
        </Suspense>
      </main>
    </div>
  );
}
