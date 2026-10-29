"use client";

import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("./location-picker"),
  {
    ssr: false,
    loading: () => (
      <div className="map-loading">Loading map...</div>
    ),
  }
);

export default function LocationPickerWrapper(props) {
  return <LocationPicker {...props} />;
}