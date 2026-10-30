
import CarDetails from "./carDetails";
import carsData from "@/data/cars.json";

function findCarById(id) {
  const seedCars = Array.isArray(carsData) ? carsData : [];

  return (
    seedCars.find(
      (item) => String(item.id) === String(id)
    ) || null
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  const car = findCarById(id);

  if (!car) {
    return {
      title: "Car Not Found | Shegger-Wheels",
      description: "The requested rental car could not be found.",
    };
  }

  const name = car.name || car.title || "Rental Car";
  const brand = car.brand || car.Brand || "";
  const model = car.model || car.Model || "";
  const price = Number(car.pricePerDay ?? car.price ?? 0);

  return {
    title: `${name} for Rent | Shegger-Wheels`,
    description: `Rent ${name}${brand ? ` by ${brand}` : ""}${model ? `, model ${model}` : ""}. ${
      Number.isFinite(price) && price > 0
        ? `Rental price: ${price.toLocaleString("en-US")} ETB per day.`
        : "View rental details and availability."
    }`,
    openGraph: {
      title: `${name} for Rent | Shegger-Wheels`,
      description: `Explore ${name} and its rental details on Shegger-Wheels.`,
      type: "website",
    },
  };
}

export const instant = false;


export default async function CarDetailsPage({ params }) {
  const { id } = await params;

  return <CarDetails key={id} />;
}
