


"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const carIcon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 14);
  }, [map, position]);

  return null;
}

export default function CarDetailMap({
  latitude,
  longitude,
  locationName = "Car pickup location",
}) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    latitude == null ||
    longitude == null ||
    latitude === "" ||
    longitude === "" ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return <p>Pickup location is not available.</p>;
  }

  const position = [lat, lng];

  return (
    <div className="car-detail-map">
      <MapContainer
        center={position}
        zoom={14}
        scrollWheelZoom
        style={{
          height: "350px",
          width: "100%",
          borderRadius: "10px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater position={position} />

        <Marker position={position} icon={carIcon}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
