

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./renter-dashboard.css";

const navigation = [
  {
    label: "Overview",
    href: "/dashboard",
   
  },
  {
    label: "My Bookings",
    href: "/bookings",
   
  },
  {
    label: "Browse Cars",
    href: "/cars",
  
  },
  {
    label: "Disputes",
    href: "/disputes",
    // icon: "⚑",
  },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="renter-dashboard-layout">
      <aside className="renter-sidebar">
        <Link href="/dashboard" className="renter-brand">
          <span className="renter-brand-icon">R</span>
          <span>Rental<span className="brand-highlight"></span></span>
        </Link>

        <div className="sidebar-section">
          <p className="sidebar-heading">MENU</p>

          <nav className="renter-navigation">
            {navigation.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`renter-nav-link ${
                    active ? "active" : ""
                  }`}
                >
                  <span className="renter-nav-icon">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

       

          <div className="renter-sidebar-footer">
          <Link href="/signout" className="renter-signout">
            Sign Out
          </Link>
        </div>
      </aside>

      <div className="renter-dashboard-main">
        <header className="renter-dashboard-header">
          <div>
            <span className="header-label">RENTER PORTAL</span>
            <h2 id="db">Dashboard</h2>
          </div>

          <Link href="/bookings" className="header-bookings-link">
            Bookings
          </Link>
        </header>

        <main className="renter-dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}