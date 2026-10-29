import carsData from "@/data/cars.json";
import CarDetails from "./carDetails";

function findSeedCar(id) {
  const seedCars = Array.isArray(carsData) ? carsData : [];

  return (
    seedCars.find(
      (car) => car.id != null && String(car.id) === String(id)
    ) || null
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const car = findSeedCar(id);

  if (!car) {
    return {
      title: "Car Details | Shegger Wheels",
      description: "Explore rental cars with Shegger Wheels.",
    };
  }

  const name = car.name || car.title || "Rental Car";

  const description =
    car.description ||
    `Explore the ${name} for rent on Shegger Wheels.`;

  const rawImage = car.image || car.imageUrl;

  const image =
    typeof rawImage === "string" && rawImage.trim()
      ? rawImage.startsWith("../images/")
        ? rawImage.replace("../images/", "/images/")
        : rawImage.startsWith("images/")
          ? `/${rawImage}`
          : rawImage
      : "/images/car-placeholder.jpg";

  return {
    title: `${name} for Rent | Shegger Wheels`,
    description,
    openGraph: {
      title: `${name} for Rent | Shegger Wheels`,
      description,
      type: "website",
      images: [{ url: image, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} for Rent | Shegger Wheels`,
      description,
      images: [image],
    },
  };
}


export const instant= false;
export default async function CarDetailsPage({ params }) {
  const { id } = await params;

  return <CarDetails key={id} />;
}