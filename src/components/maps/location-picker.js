
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./location-map.css";

const DEFAULT_POSITION = [9.03, 38.74];

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        name: `Map point (${event.latlng.lat.toFixed(6)}, ${event.latlng.lng.toFixed(6)})`,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [carIcon, setCarIcon] = useState(null);

  useEffect(() => {
    let active = true;

    import("leaflet").then(({ default: L }) => {
      if (!active) return;

      setCarIcon(
        L.icon({
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      );
    });

    return () => {
      active = false;
    };
  }, []);

  const position = useMemo(() => {
    const lat = Number(value?.latitude);
    const lng = Number(value?.longitude);

    if (
      value?.latitude != null &&
      value?.longitude != null &&
      value.latitude !== "" &&
      value.longitude !== "" &&
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return [lat, lng];
    }

    return DEFAULT_POSITION;
  }, [value?.latitude, value?.longitude]);

  async function handleSearch() {
    const searchText = query.trim();

    if (!searchText) {
      setError("Enter a place name or address.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const params = new URLSearchParams({
        q: searchText,
        format: "jsonv2",
        limit: "8",
        countrycodes: "et",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`
      );

      if (!response.ok) {
        throw new Error("Location search is temporarily unavailable.");
      }

      const data = await response.json();

      if (!data.length) {
        setError("No locations found. Try another address.");
        return;
      }

      setResults(data);
    } catch (err) {
      setError(err.message || "Could not search for this location.");
    } finally {
      setLoading(false);
    }
  }

  function selectLocation(result) {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      setError("The selected location has invalid coordinates.");
      return;
    }

    onChange({
      name: result.display_name,
      latitude,
      longitude,
    });

    setQuery(result.display_name);
    setResults([]);
    setError("");
  }

  function selectMapPoint(location) {
    onChange(location);
    setQuery("");
    setResults([]);
    setError("");
  }

  return (
    <div className="location-picker">
      <div className="location-search-form">
        <label htmlFor="location-search">
          Search for a pickup address
        </label>

        <div className="location-search-controls">
          <input
            id="location-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearch();
              }
            }}
            placeholder="e.g. Piassa, Addis Ababa"
            autoComplete="off"
          />

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <p className="location-search-error" role="alert">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="location-search-results">
          <p>Select a search result:</p>

          {results.map((result) => (
            <button
              type="button"
              key={`${result.osm_type}-${result.osm_id}`}
              className="location-result"
              onClick={() => selectLocation(result)}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}

      <p className="map-instructions">
        Search for an address or click the map to select the pickup point.
      </p>

      <MapContainer
        center={DEFAULT_POSITION}
        zoom={12}
        scrollWheelZoom={true}
        style={{
          height: "350px",
          width: "100%",
          marginTop: "16px",
          borderRadius: "10px",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater position={position} />

        <MapClickHandler onSelect={selectMapPoint} />

        {value && carIcon && (
          <Marker position={position} icon={carIcon} />
        )}
      </MapContainer>

      {value && (
        <div className="selected-location" aria-live="polite">
          <p>
            <strong>Selected point:</strong> {value.name}
          </p>
          <p>
            <strong>Latitude:</strong> {position[0].toFixed(6)}
          </p>
          <p>
            <strong>Longitude:</strong> {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}
