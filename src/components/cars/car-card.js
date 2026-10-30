
import Link from "next/link";

export default function CarCard({ car }) {
  if (!car || car.id == null || String(car.id).trim() === "") {
    return null;
  }

  const carId = encodeURIComponent(String(car.id));
  const detailsUrl = `/cars/${carId}`;

  const image =
    car.image ||
    car.imageUrl ||
    "/images/car-placeholder.jpg";

  const name = car.name || car.title || "Rental car";
  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return (
    <article className="car-card">
      <Link
        href={detailsUrl}
        className="car-card-image"
        style={{ backgroundImage: `url("${image}")` }}
        aria-label={`View details for ${name}`}
      />

      <div className="car-card-content">
        <div className="car-card-heading">
          <h3>
            <Link href={detailsUrl}>{name}</Link>
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

          <div>
            <small>View details</small>
            <Link
              className="vd"
              href={detailsUrl}
              aria-label={`View details for ${name}`}
            >
               →
            </Link>


    
          </div>
        </div>
      </div>
    </article>
  );
}
