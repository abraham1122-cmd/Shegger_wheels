

import carsData from "@/data/cars.json";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||  "http://localhost:3000";

export default function sitemap() {

  const publicRoutes = [
    "",
    "/cars",
  ];

  const staticPages = publicRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.9,
  }));


  const carPages = (Array.isArray(carsData) ? carsData : []).map(
    (car) => ({
      url: `${SITE_URL}/cars/${encodeURIComponent(car.id)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticPages, ...carPages];
}