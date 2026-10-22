
import CarDetails from "@/app/(renter)/cars/[id]/page";

export default function CarCard({ car }) {
  const image = car.image || car.imageUrl || "/images/car-placeholder.jpg";
  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return (
    <article className="car-card">
      <a
        href={`/cars/${car.id}`}
        className="car-card-image"
        style={{ backgroundImage: `url("${image}")` }}
        aria-label={`View ${car.name}`}
      >
        {/* <span className="car-type">{car.type || car.category || "Car"}</span> */}
        {/* <span className="save-icon" aria-hidden="true">♡</span> */}
      </a>

      <div className="car-card-content">
        <div className="car-card-heading">
          <h3>
            <a href={`/cars/${car.id}`}>{car.name}</a>
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
          {car.transmission && <span>{car.transmission}</span>}
          {car.seats && <span>{car.seats} seats</span>}
        </div>

        <div className="car-card-bottom">
          <p>
            <strong>{price.toLocaleString("en-US")} ETB</strong>
            <span> / day</span>
          </p>
          <a href={`/cars/${car.id}`} aria-label={`View ${car.name}`}>
            ↗
          </a>
        </div>
      </div>
    </article>
  );
}
