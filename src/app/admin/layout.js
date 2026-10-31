"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./admin.css";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin#cars", label: "Manage Cars" },
  { href: "/admin#bookings", label: "Bookings" },
  { href: "/admin#reports", label: "Reports" },
  { href: "/admin/disputes", label: "Disputes" },
];

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      <button
        type="button"
        className={`admin-sidebar-overlay ${
          menuOpen ? "admin-overlay-visible" : ""
        }`}
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
      />

      {/* Sidebar */}
      <aside
        id="admin-navigation"
        className={`admin-sidebar ${
          menuOpen ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-brand">
          <Link
            href="/admin"
            className="admin-logo"
            onClick={() => setMenuOpen(false)}
          >
            CarRental
          </Link>

          <p>Administration panel</p>
        </div>

        <nav className="admin-navigation" aria-label="Admin navigation">
          {adminLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="admin-nav-divide" />

          {/* <Link
            href="/"
            className="admin-nav-link admin-back-link"
            onClick={() => setMenuOpen(false)}
          >
            Back to website
          </Link> */}
        </nav>

        <div className="admin-sidebar-footer">
          Car rental marketplace
          <br />
          Admin workspace
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-menu-button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="admin-navigation"
            >
              <span className="admin-menu-icon">
                <span />
                <span />
                <span />
              </span>
            </button>

            <div>
              <p className="admin-header-title">Admin Workspace</p>
              <p className="admin-header-subtitle">
                Manage your marketplace
              </p>
            </div>
          </div>

          <Link href="/" className="admin-website-link">
            View website
          </Link>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}