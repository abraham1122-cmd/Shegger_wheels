
import Link from "next/link";
import "./admin.css";

export const metadata = {
  title: "Admin Dashboard | Car Rental",
  description: "Manage users, cars, bookings, and reports.",
};

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "" },
  { href: "/admin#cars", label: "Manage Cars", icon: "" },
  { href: "/admin#bookings", label: "Bookings", icon: "" },
  { href: "/admin#reports", label: "Reports", icon: "" },
];

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link href="/admin" className="admin-logo">
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
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="admin-nav-divider" />

          <Link href="/" className="admin-nav-link admin-back-link">
            <span aria-hidden="true">←</span>
            Back to website
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          Car rental marketplace
          <br />
          Admin workspace
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-header-title">Admin Workspace</p>
            <p className="admin-header-subtitle">
              Manage your marketplace
            </p>
          </div>

          <Link href="/" className="admin-website-link">
            View website
          </Link>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
