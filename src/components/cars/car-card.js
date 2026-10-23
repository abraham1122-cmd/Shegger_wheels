
import Link from "next/link";

export default function CarCard({ car }) {
  const image =
    car.image || car.imageUrl || "/images/car-placeholder.jpg";

  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return (
    <article className="car-card">
      <Link
        href={`/cars/${encodeURIComponent(String(car.id))}`}
        className="car-card-image"
        style={{ backgroundImage: `url("${image}")` }}
        aria-label={`View ${car.name}`}
      />

      <div className="car-card-content">
        <div className="car-card-heading">
          <h3>
            <Link href={`/cars/${encodeURIComponent(String(car.id))}`}>
              {car.name}
            </Link>
          </h3>

          {car.rating != null && (
            <span className="car-rating">★ {car.rating}</span>
          )}
        </div>

        <p className="car-location">
          {car.location || "Location available on request"}
          {car.year ? ` · ${car.year}` : ""}
        </p>

        <div className="car-specs">
          {(car.transmission || car.Transmition) && (
            <span>{car.transmission || car.Transmition}</span>
          )}
          {(car.seats || car.Seats) && (
            <span>{car.seats || car.Seats} seats</span>
          )}
        </div>

        <div className="car-card-bottom">
          <p>
            <strong>{price.toLocaleString("en-US")} ETB</strong>
            <span> / day</span>
          </p>
         

         <small>view-details</small>
          <Link
        className="vd"
           href={`/cars/${encodeURIComponent(String(car.id))}`}
         >
              →
   </Link>
        </div>
      </div>
    </article>
  );
}
