import { useEffect, useRef, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";

export default function MapContainer({
  mapContainer,
  mapboxToken,
  lng,
  lat,
  zoom,
  pins,
  mapLoaded,
  map,
  onDeletePin,
  locationTypes = [],
}) {
  const markersRef = useRef(new Map());
  const lastPinsRef = useRef([]);

  const markerConfigs = useMemo(() => {
    const configs = {
      been_there: {
        class: "been-there-marker",
        color: "#10b981",
        display: "Been There",
      },
      want_to_go: {
        class: "want-to-go-marker",
        color: "#f59e0b",
        display: "Want to Go",
      },
    };

    const colors = [
      "#6366f1",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ef4444",
      "#6b7280",
    ];

    const customTypes = locationTypes.filter(
      (type) => type !== "been_there" && type !== "want_to_go"
    );

    customTypes.forEach((type, index) => {
      configs[type] = {
        class: "custom-marker",
        color: colors[Math.min(index, colors.length - 1)],
        display: type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      };
    });

    return configs;
  }, [locationTypes]);

  const closeAllPopups = useCallback(() => {
    markersRef.current.forEach((marker) => {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        marker.getPopup().remove();
      }
      const markerElement = marker.getElement();
      if (markerElement) {
        markerElement.classList.remove("selected");
      }
    });
  }, []);

  const hasOpenPopup = useCallback(() => {
    for (let marker of markersRef.current.values()) {
      if (marker.getPopup() && marker.getPopup().isOpen()) {
        return true;
      }
    }
    return false;
  }, []);

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

  const memoizedPins = useMemo(() => pins || [], [pins]);

  const createPopupHTML = useCallback((pin, config) => {
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

    const addressHTML = pin.address
      ? `<div class="popup-section"><p><strong>Address:</strong> ${pin.address}</p></div>`
      : "";

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

  useEffect(() => {
    if (!map.current || !mapLoaded || !memoizedPins) return;

    const pinsChanged =
      lastPinsRef.current.length !== memoizedPins.length ||
      lastPinsRef.current.some(
        (pin, index) =>
          !memoizedPins[index] || pin.id !== memoizedPins[index].id
      );

    if (!pinsChanged) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    memoizedPins.forEach((pin) => {
      const lng = parseFloat(pin.longitude);
      const lat = parseFloat(pin.latitude);

      if (isNaN(lng) || isNaN(lat)) return;

      const config =
        markerConfigs[pin.locationType] || markerConfigs.been_there;

      const el = document.createElement("div");
      el.className = `custom-marker ${config.class}`;
      el.style.setProperty("--marker-color", config.color);

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

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllPopups();
        el.classList.add("selected");
        marker.getPopup().addTo(map.current);
      });

      popup.on("close", () => {
        el.classList.remove("selected");
      });
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

  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
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
      <div className="map-info">
        Lng: {lng} | Lat: {lat} | Zoom: {zoom}
      </div>
    </div>
  );
}
