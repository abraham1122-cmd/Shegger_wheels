
import Link from "next/link";

export default function OwnerDashboard() {
  return (
    <section className="owner-dashboard">
      <div className="owner-heading">
        <div>
          <p className="owner-eyebrow">OWNER WORKSPACE</p>
          <h1>Owner Dashboard</h1>
          <p>Manage your cars, approvals, and bookings from one place.</p>
        </div>

        <Link className="owner-primary-button" href="/owner/cars/new">
          Add a Car
        </Link>
      </div>

      <div className="owner-stats">
        <article className="owner-stat-card">
          <span>My Cars</span>
          <strong>Manage</strong>
          <p>View your listings and check their approval status.</p>
          <Link href="/owner/cars">Manage my cars →</Link>
        </article>

        <article className="owner-stat-card">
          <span>Bookings</span>
          <strong>Manage</strong>
          <p>Review booking requests and booking status.</p>
          <Link href="/owner/bookings">View bookings →</Link>
        </article>

        <article className="owner-stat-card">
          <span>New Listing</span>
          <strong>Submit</strong>
          <p>Submit a car for admin approval before publishing.</p>
          <Link href="/owner/cars/new">Submit a car →</Link>
        </article>
      </div>

      <div className="owner-welcome">
        <h2>How car publishing works</h2>
        <p>
          First, submit your car for admin approval. Once approved,
          visit My Cars to publish your listing. Pending or rejected
          cars cannot be published.
        </p>
        <Link className="owner-primary-button" href="/owner/cars">
          Manage My Cars
        </Link>
      </div>
    </section>
  );
}
