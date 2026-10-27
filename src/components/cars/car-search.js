"use client";

export default function CarSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className="car-search">
      <label htmlFor="search" className="car-search-label">
      
      </label>

      <div className="car-search-input-wrapper">
        <span className="car-search-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          type="search"
          id="search"
          placeholder="Search by car name, brand, or model..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="car-search-input"
        />
      </div>
    </div>
  );
}