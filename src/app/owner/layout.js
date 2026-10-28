
import Link from "next/link";
import "./Owner.css";

export default function OwnerLayout({ children }) {
  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <h2>Owner</h2>

        <nav>
          <Link href="/owner">Dashboard</Link>
          <Link href="/owner/cars">My Cars</Link>
          <Link href="/owner/cars/new">Plus Car</Link>
          <Link href="/owner/bookings">Booking-Request</Link>
          <Link href="/owner/earnings">Earnings</Link>
          <Link href="/owner/disputes">Disputes</Link>
        </nav>



         <div className="owner-sidebar-footer">
          <Link href="/signout" className="owner-signout">
            Sign Out
          </Link>
        </div>

      </aside>

      <main className="owner-content">{children}</main>

     
    </div>
  );
}
