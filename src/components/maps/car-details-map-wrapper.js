



"use client";

import dynamic from "next/dynamic";

const CarDetailMap = dynamic(
  () => import("./car-detail-map"),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading">Loading map...</div>
    ),
  }
);

export default function CarDetailMapWrapper(props) {
  return <CarDetailMap {...props} />;
}
