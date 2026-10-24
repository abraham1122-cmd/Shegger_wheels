
import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <section className="owner-dashboard">
      <div className="owner-heading">
        <div>
          <p className="owner-eyebrow">OWNER WORKSPACE</p>
          <h1>Owner Dashboard</h1>
          <p>Manage your cars and bookings from one place.</p>
        </div>

        <Link className="owner-primary-button" href="/owner/cars/new">
           Add a Car
        </Link>
      </div>

      <div className="owner-stats">
        <article className="owner-stat-card">
          <span>My Cars</span>
          <strong>Manage</strong>
          <p>View and update your listings.</p>
          <Link href="/owner/cars">View my cars →</Link>
        </article>

        <article className="owner-stat-card">
          <span>Bookings</span>
          <strong>Manage</strong>
          <p>Review booking requests and status.</p>
          <Link href="/owner/bookings">View bookings →</Link>
        </article>

        <article className="owner-stat-card">
          <span>New Listing</span>
          <strong>Get started</strong>
          <p>Add a car to your rental marketplace.</p>
          <Link href="/owner/cars/new">Add a car →</Link>
        </article>
      </div>

      <div className="owner-welcome">
        <h2>Welcome to your workspace</h2>
        <p>
          Use the sidebar to manage your vehicles, publish listings,
          and handle incoming rental requests.
        </p>
      </div>
    </section>
  );
}
