import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import { generateMarkerConfigs } from "../utils/locationColors";

export default function MapContainer({
  mapContainer,
  mapboxToken,
  lng,
  lat,
  zoom,
  pins,
  searchResults = [],
  // selectedSearchResult = null,
  mapLoaded,
  map,
  onDeletePin,
  onSearchMarkerClick,
  locationTypes = [],
}) {
  // Current location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const userLocationMarker = useRef(null);

  // Create a ref to store regular markers
  const markersRef = useRef(new Map());
  // .. store Map of search result markers
  const searchMarkersRef = useRef(new Map());
  // .. store previous pins array to detect changes and avoid unnecessary re-renders
  const lastPinsRef = useRef([]);
  // .. store previous search results array to detect changes
  const lastSearchResultsRef = useRef([]);

  // Create marker configs only when location type changes
  const markerConfigs = useMemo(() => {
    return generateMarkerConfigs(locationTypes);
  }, [locationTypes]);

  // Current location functions
  const showLocationError = useCallback((message) => {
    setLocationError(message);
    setTimeout(() => setLocationError(""), 3000);
  }, []);

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

        // Create a new marker for user location
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
        let message = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }

        showLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [map, showLocationError]);

  // Memoize function to prevent unnecessary re-renders
  const closeAllPopups = useCallback(() => {
    // Close all popups on reg markers and remove "selected" class
    markersRef.current.forEach((marker) => {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        marker.getPopup().remove();
      }
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.remove("selected");
      }
    });
    // .. do the same on search result markers
    searchMarkersRef.current.forEach((marker) => {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        marker.getPopup().remove();
      }
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.remove("selected");
      }
    });
  }, []);

  // Check if any popup is open across all markers
  const hasOpenPopup = useCallback(() => {
    for (let marker of markersRef.current.values()) {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        return true;
      }
    }
    for (let marker of searchMarkersRef.current.values()) {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        return true;
      }
    }
    return false;
  }, []);

  //
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

  // Memoize pins array, defaulting to empty array if pins is null/undefined
  const memoizedPins = useMemo(() => pins || [], [pins]);
  // .. do the same for search results array
  const memoizedSearchResults = useMemo(
    () => searchResults || [],
    [searchResults]
  );

  // Create HTML content for reg pin popups
  const createPopupHTML = useCallback((pin, config) => {
    // Generate rating HTML if the pin has rating
    const ratingHTML = pin.rating
      ? `
        <div class="popup-section">
          <p><strong>Rating:</strong></p>
          <div class="rating-display">
            <span class="stars">${"★".repeat(pin.rating)}${"☆".repeat(
          5 - pin.rating
        )}</span>
            <span class="rating-number">${pin.rating}/5</span>
          </div>
        </div>
      `
      : "";
    // Generate addess HTML is the pin has address
    const addressHTML = pin.address
      ? `<div class="popup-section"><p><strong>Address:</strong> ${pin.address}</p></div>`
      : "";
    // Generate notes HTML is the pin has notes
    const notesHTML = pin.notes
      ? `<div class="popup-section"><p><strong>Notes:</strong> ${pin.notes}</p></div>`
      : "";

    return `
      <div class="marker-popup">
        <h3>${pin.name}</h3>
        ${addressHTML}
        ${notesHTML}
        ${ratingHTML}
        <div class="popup-section">
          <span class="type-badge" style="background-color: ${config.color}20; color: ${config.color}; border: 1px solid ${config.color}40;">
            ${config.display}
          </span>
        </div>
        <button onclick="window.deletePin(${pin.id})" class="delete-pin-btn">
          Delete Location
        </button>
      </div>
    `;
  }, []);

  // Create HTML content for search result popups
  const createSearchPopupHTML = useCallback((searchMarker) => {
    // Extract and format address from search data
    const address = searchMarker.searchData?.place_name || "";
    const addressParts = address.split(", ");
    const formattedAddress = addressParts.slice(1).join(", ");

    return `
      <div class="marker-popup search-popup">
        <h3>${searchMarker.name}</h3>
        ${
          formattedAddress
            ? `<div class="popup-section"><p><strong>Address:</strong> ${formattedAddress}</p></div>`
            : ""
        }
        <div class="popup-section">
          <span class="type-badge" style="background-color: #3b82f620; color: #3b82f6; border: 1px solid #3b82f640;">
            Search Result
          </span>
        </div>
        <button onclick="window.addSearchPin('${
          searchMarker.id
        }')" class="add-pin-btn">
          Add as Pin
        </button>
      </div>
    `;
  }, []);

  // Handle regular pins
  useEffect(() => {
    // Return if map isn't ready/pins unavailable
    if (!map.current || !mapLoaded || !memoizedPins) return;

    // Check if pins changed
    const pinsChanged =
      lastPinsRef.current.length !== memoizedPins.length ||
      lastPinsRef.current.some(
        (pin, index) =>
          !memoizedPins[index] || pin.id !== memoizedPins[index].id
      );
    if (!pinsChanged) return;

    // Remove all existing markers from map/clear markers map
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Iterate though each pin to create markers
    memoizedPins.forEach((pin) => {
      // Convert coordinates to numbers
      const lng = parseFloat(pin.longitude);
      const lat = parseFloat(pin.latitude);
      if (isNaN(lng) || isNaN(lat)) return;

      // Get marker config for this pin's location type, defaulting to been_there
      const config =
        markerConfigs[pin.locationType] || markerConfigs.been_there;

      // Create DOM element for the marker
      const el = document.createElement("div");
      el.className = `custom-marker ${config.class}`;
      el.style.setProperty("--marker-color", config.color);

      // Create mapbox popup with custom setting and HTML content
      const popup = new mapboxgl.Popup({
        offset: 8,
        closeOnClick: false,
        closeButton: true,
        className: "custom-popup",
      }).setHTML(createPopupHTML(pin, config));

      // Create mapbox marker with custom element, set position, attach popup, add to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);
      // Store marker in markers mapusing pin ID as key
      markersRef.current.set(pin.id, marker);

      // Only allow one popup at a time
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllPopups();
        el.classList.add("selected");
        marker.getPopup().addTo(map.current);
      });

      // Remove selected class when popup is closed
      popup.on("close", () => {
        el.classList.remove("selected");
      });
    });

    // Store copy of current pins to detect changes in next render
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

    // Add new search markers
    memoizedSearchResults.forEach((searchMarker) => {
      const lng = parseFloat(searchMarker.longitude);
      const lat = parseFloat(searchMarker.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const el = document.createElement("div");
      el.className = "custom-marker search-result-marker";
      el.style.setProperty("--marker-color", "#3b82f6");

      // Add pulsing animation for search results
      el.classList.add("search-marker-pulse");

      // Create popup for search marker
      const popup = new mapboxgl.Popup({
        offset: 8,
        closeOnClick: false,
        closeButton: true,
        className: "custom-popup search-popup",
      }).setHTML(createSearchPopupHTML(searchMarker));

      // Create and add marker to map
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

      popup.on("close", () => {
        el.classList.remove("selected");
      });
    });

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
      >
        {locationLoading ? (
          <div className="spinner"></div>
        ) : (
          <span>{locationError ? "❌" : "📍"}</span>
        )}
      </button>

      {locationError && (
        <div className="location-error show">{locationError}</div>
      )}

      <div className="map-info">
        Lng: {lng} | Lat: {lat} | Zoom: {zoom}
      </div>
    </div>
  );
}
