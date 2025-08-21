import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import { generateMarkerConfigs } from "../utils/locationColors";

const LOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export default function MapContainer({
  mapContainer,
  mapboxToken,
  lng,
  lat,
  zoom,
  pins,
  searchResults = [],
  mapLoaded,
  map,
  onDeletePin,
  onSearchMarkerClick,
  locationTypes = [],
}) {
  // Current location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Live map coordinates
  const [currentLng, setCurrentLng] = useState(lng);
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  // Refs for tracking markers and data
  const userLocationMarker = useRef(null);
  const markersRef = useRef(new Map());
  const searchMarkersRef = useRef(new Map());
  const lastPinsRef = useRef([]);
  const lastSearchResultsRef = useRef([]);

  // Memoized data
  const memoizedPins = useMemo(() => pins || [], [pins]);
  const memoizedSearchResults = useMemo(
    () => searchResults || [],
    [searchResults]
  );
  const markerConfigs = useMemo(
    () => generateMarkerConfigs(locationTypes),
    [locationTypes]
  );

  // Update live coordinates when map moves
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const updateCoordinates = () => {
      const center = map.current.getCenter();
      const mapZoom = map.current.getZoom();

      setCurrentLng(Number(center.lng.toFixed(4)));
      setCurrentLat(Number(center.lat.toFixed(4)));
      setCurrentZoom(Number(mapZoom.toFixed(2)));
    };

    map.current.on("move", updateCoordinates);
    map.current.on("zoom", updateCoordinates);
    updateCoordinates();

    return () => {
      if (map.current) {
        map.current.off("move", updateCoordinates);
        map.current.off("zoom", updateCoordinates);
      }
    };
  }, [map, mapLoaded]);

  // Location error handler
  const showLocationError = useCallback((message) => {
    setLocationError(message);
    setTimeout(() => setLocationError(""), 3000);
  }, []);

  // Get current location function
  const getCurrentLocation = useCallback(() => {
    if (!map.current || !navigator.geolocation) {
      showLocationError("Geolocation is not supported by this browser");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Remove existing user location marker
        if (userLocationMarker.current) {
          userLocationMarker.current.remove();
        }

        // Create new marker for user location
        userLocationMarker.current = new mapboxgl.Marker({
          color: "#3b82f6",
          scale: 1.2,
        })
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 8 }).setHTML(
              "<div><strong>Your Location</strong></div>"
            )
          )
          .addTo(map.current);

        // Fly to user location
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          speed: 1.2,
          curve: 1.42,
        });

        setLocationLoading(false);
      },
      (error) => {
        const errorMessages = {
          [error.PERMISSION_DENIED]: "Location access denied by user",
          [error.POSITION_UNAVAILABLE]: "Location information unavailable",
          [error.TIMEOUT]: "Location request timed out",
        };

        showLocationError(
          errorMessages[error.code] || "Unable to get your location"
        );
        setLocationLoading(false);
      },
      LOCATION_OPTIONS
    );
  }, [map, showLocationError]);

  // Close all popups function
  const closeAllPopups = useCallback(() => {
    const allMarkers = [
      ...markersRef.current.values(),
      ...searchMarkersRef.current.values(),
    ];

    allMarkers.forEach((marker) => {
      if (marker.getPopup()?.isOpen()) {
        marker.getPopup().remove();
      }
      marker.getElement()?.classList.remove("selected");
    });
  }, []);

  // Check if any popup is open
  const hasOpenPopup = useCallback(() => {
    const allMarkers = [
      ...markersRef.current.values(),
      ...searchMarkersRef.current.values(),
    ];

    return allMarkers.some((marker) => marker.getPopup()?.isOpen());
  }, []);

  // Expose functions to window for popup buttons
  useEffect(() => {
    window.closeAllPopups = closeAllPopups;
    window.hasOpenPopup = hasOpenPopup;
    window.deletePin = onDeletePin;

    return () => {
      delete window.closeAllPopups;
      delete window.hasOpenPopup;
      delete window.deletePin;
    };
  }, [closeAllPopups, hasOpenPopup, onDeletePin]);

  // Create popup HTML for regular pins
  const createPopupHTML = useCallback((pin, config) => {
    const ratingHTML = pin.rating
      ? `<div class="popup-section">
           <div class="rating-display">
             <span class="stars">${"★".repeat(pin.rating)}${"☆".repeat(
          5 - pin.rating
        )}</span>
           </div>
         </div>`
      : "";

    const addressHTML = pin.address
      ? `<div class="popup-section"><p>${pin.address}</p></div>`
      : "";

    const notesHTML = pin.notes
      ? `<div class="popup-section"><p>${pin.notes}</p></div>`
      : "";

    return `
      <div class="marker-popup">
        <h3>${pin.name}</h3>
        ${ratingHTML}
        ${addressHTML}
        ${notesHTML}
        <span class="type-badge" style="background-color: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}40;">
          ${config.display}
        </span>
        <button onclick="window.deletePin(${pin.id})" class="tag-btn">
          Delete
        </button>
      </div>
    `;
  }, []);

  // Create popup HTML for search results
  const createSearchPopupHTML = useCallback((searchMarker) => {
    const address = searchMarker.searchData?.place_name || "";
    const formattedAddress = address.split(", ").slice(1).join(", ");

    return `
      <div class="marker-popup search-popup">
        <h3>${searchMarker.name}</h3>
        ${
          formattedAddress
            ? `<div class="popup-section"><p>${formattedAddress}</p></div>`
            : ""
        }
        <span class="type-badge" style="background-color: #3b82f620; color: #3b82f6; border: 1px solid #3b82f640;">
          Search Result
        </span>
        <button onclick="window.addSearchPin('${
          searchMarker.id
        }')" class="tag-btn search-popup">
          Add as Pin
        </button>
      </div>
    `;
  }, []);

  // Create marker element
  const createMarkerElement = (config, isSearchResult = false) => {
    const el = document.createElement("div");
    el.className = `custom-marker ${config.class}`;
    el.style.setProperty("--marker-color", config.color);

    if (isSearchResult) {
      el.classList.add("search-marker-pulse");
    }

    return el;
  };

  // Add click handler to marker
  const addMarkerClickHandler = (el, marker, closeAllPopups) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      closeAllPopups();
      el.classList.add("selected");
      marker.getPopup().addTo(map.current);
    });
  };

  // Handle regular pins
  useEffect(() => {
    if (!map.current || !mapLoaded || !memoizedPins) return;

    // Check if pins changed
    const pinsChanged =
      lastPinsRef.current.length !== memoizedPins.length ||
      lastPinsRef.current.some(
        (pin, index) =>
          !memoizedPins[index] || pin.id !== memoizedPins[index].id
      );

    if (!pinsChanged) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Create new markers
    memoizedPins.forEach((pin) => {
      const lng = parseFloat(pin.longitude);
      const lat = parseFloat(pin.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const config =
        markerConfigs[pin.locationType] || markerConfigs.been_there;
      const el = createMarkerElement(config);

      const popup = new mapboxgl.Popup({
        offset: 8,
        closeOnClick: false,
        closeButton: true,
        className: "custom-popup",
      }).setHTML(createPopupHTML(pin, config));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.set(pin.id, marker);
      addMarkerClickHandler(el, marker, closeAllPopups);

      popup.on("close", () => el.classList.remove("selected"));
    });

    lastPinsRef.current = [...memoizedPins];
  }, [
    memoizedPins,
    mapLoaded,
    map,
    markerConfigs,
    createPopupHTML,
    closeAllPopups,
  ]);

  // Handle search result markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Check if search results changed
    const searchChanged =
      lastSearchResultsRef.current.length !== memoizedSearchResults.length ||
      lastSearchResultsRef.current.some(
        (result, index) =>
          !memoizedSearchResults[index] ||
          result.id !== memoizedSearchResults[index].id
      );

    if (!searchChanged) return;

    // Clear existing search markers
    searchMarkersRef.current.forEach((marker) => marker.remove());
    searchMarkersRef.current.clear();

    // Create new search markers
    memoizedSearchResults.forEach((searchMarker) => {
      const lng = parseFloat(searchMarker.longitude);
      const lat = parseFloat(searchMarker.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const config = { color: "#3b82f6", class: "search-result-marker" };
      const el = createMarkerElement(config, true);

      const popup = new mapboxgl.Popup({
        offset: 8,
        closeOnClick: false,
        closeButton: true,
        className: "custom-popup search-popup",
      }).setHTML(createSearchPopupHTML(searchMarker));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      searchMarkersRef.current.set(searchMarker.id, marker);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setTimeout(() => {
          closeAllPopups();
          el.classList.add("selected");
          marker.getPopup().addTo(map.current);
        }, 10);
      });

      popup.on("close", () => el.classList.remove("selected"));
    });

    // Expose addSearchPin function
    window.addSearchPin = (searchMarkerId) => {
      const searchMarker = memoizedSearchResults.find(
        (m) => m.id === searchMarkerId
      );
      if (searchMarker && onSearchMarkerClick) {
        onSearchMarkerClick(searchMarker);
      }
    };

    lastSearchResultsRef.current = [...memoizedSearchResults];
  }, [
    memoizedSearchResults,
    mapLoaded,
    map,
    createSearchPopupHTML,
    closeAllPopups,
    onSearchMarkerClick,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      searchMarkersRef.current.forEach((marker) => marker.remove());
      searchMarkersRef.current.clear();

      if (userLocationMarker.current) {
        userLocationMarker.current.remove();
      }

      if (window.addSearchPin) {
        delete window.addSearchPin;
      }
    };
  }, []);

  if (!mapboxToken) {
    return (
      <div className="map-box">
        <div className="map-message">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="map-box">
      <div ref={mapContainer} className="map-container" />

      <button
        className={`current-location-btn ${locationLoading ? "loading" : ""} ${
          locationError ? "error" : ""
        }`}
        onClick={getCurrentLocation}
        disabled={locationLoading}
        title="Go to current location"
        type="button"
      >
        {locationLoading ? (
          <div className="spinner" />
        ) : (
          <span>{locationError ? "⌘" : "➢"}</span>
        )}
      </button>

      {locationError && (
        <div className="location-error show">{locationError}</div>
      )}

      <div className="map-info">
        Lng: {currentLng} | Lat: {currentLat} | Zoom: {currentZoom}
      </div>
    </div>
  );
}
