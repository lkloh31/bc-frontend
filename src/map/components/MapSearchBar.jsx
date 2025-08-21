import { useState, useRef, useEffect } from "react";

const SEARCH_DELAY = 300;
const RESULT_LIMIT = 5;
const MAPBOX_GEOCODING_URL =
  "https://api.mapbox.com/geocoding/v5/mapbox.places";
const SEARCH_TYPES = "place,postcode,locality,neighborhood,address";

export default function MapSearchBar({
  mapboxToken,
  onLocationSelect,
  onSearchResult,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchTimeout = useRef(null);
  const searchContainerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current?.contains(event.target)) return;

      setShowResults(false);
      setSelectedIndex(-1);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim() || !mapboxToken) return;

    setIsLoading(true);
    try {
      const url = `${MAPBOX_GEOCODING_URL}/${encodeURIComponent(
        searchQuery
      )}.json`;
      const params = new URLSearchParams({
        access_token: mapboxToken,
        limit: RESULT_LIMIT,
        types: SEARCH_TYPES,
      });

      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      const features = data.features || [];

      setResults(features);
      setShowResults(true);
      setSelectedIndex(-1);
      onSearchResult?.(features);
    } catch (error) {
      console.error("Geocoding error:", error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.trim()) {
      searchTimeout.current = setTimeout(() => {
        searchLocation(value);
      }, SEARCH_DELAY);
    } else {
      clearSearch();
    }
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleLocationSelect = (location) => {
    const [lng, lat] = location.center;

    setQuery(location.place_name);
    setShowResults(false);
    setSelectedIndex(-1);

    onLocationSelect?.({
      lng,
      lat,
      name: location.text || location.place_name,
      fullName: location.place_name,
      address: location.properties?.address || "",
      location,
    });
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const formatLocationText = (feature) => {
    const parts = feature.place_name.split(", ");
    return {
      primary: parts[0],
      secondary: parts.slice(1).join(", "),
    };
  };

  const handleFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div className="map-search-container" ref={searchContainerRef}>
      <div className="map-search-input-wrapper">
        <div className="search-icon">🔍</div>

        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder="Search for a location..."
          className="map-search-input"
          disabled={!mapboxToken}
        />

        {isLoading && (
          <div className="search-loading">
            <div className="search-spinner" />
          </div>
        )}

        {query && (
          <button
            onClick={clearSearch}
            className="search-clear-btn"
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="map-search-results">
          {results.map((feature, index) => {
            const { primary, secondary } = formatLocationText(feature);
            const isSelected = index === selectedIndex;

            return (
              <div
                key={feature.id || index}
                className={`search-result-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleLocationSelect(feature)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="result-icon">📍</div>
                <div className="result-text">
                  <div className="result-primary">{primary}</div>
                  {secondary && (
                    <div className="result-secondary">{secondary}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showResults && results.length === 0 && query.trim() && !isLoading && (
        <div className="map-search-results">
          <div className="search-no-results">
            No locations found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
