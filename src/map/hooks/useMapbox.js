import { useRef, useEffect, useState, useCallback } from "react";
import { useApi } from "../../api/ApiContext";
import mapboxgl from "mapbox-gl";

const DEFAULT_COORDINATES = {
  lng: -122.4194,
  lat: 37.7749,
  zoom: 10,
};

export function useMapbox(token) {
  const { request } = useApi();

  // Refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const updateTimeoutRef = useRef(null);

  // State
  const [lng, setLng] = useState(DEFAULT_COORDINATES.lng);
  const [lat, setLat] = useState(DEFAULT_COORDINATES.lat);
  const [zoom, setZoom] = useState(DEFAULT_COORDINATES.zoom);
  const [mapboxToken, setMapboxToken] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      if (!token) return;

      try {
        const response = await request("/map/mapbox-token");
        setMapboxToken(response.accessToken);
        mapboxgl.accessToken = response.accessToken;
      } catch (err) {
        console.error("Failed to get Mapbox token:", err);
      }
    };

    getMapboxToken();
  }, [token, request]);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapboxToken || !mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Map event handlers
      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapLoaded(false);
      }
    };
  }, [mapboxToken, lng, lat, zoom]);

  // Add click handler to map
  const addClickHandler = useCallback((onMapClick) => {
    if (!map.current) return;

    // Remove existing click handlers
    map.current.off("click");

    map.current.on("click", (e) => {
      // Check if any popup is open
      if (window.hasOpenPopup?.()) {
        window.closeAllPopups?.();
        return;
      }

      const clickedElement = e.originalEvent.target;

      // Check if click was on a marker or control
      const isMarkerOrControl =
        clickedElement &&
        (clickedElement.classList.contains("custom-marker") ||
          clickedElement.closest(".custom-marker") ||
          clickedElement.classList.contains("mapboxgl-marker") ||
          clickedElement.closest(".mapboxgl-marker") ||
          clickedElement.closest(".mapboxgl-ctrl") ||
          clickedElement.closest(".mapboxgl-popup"));

      if (isMarkerOrControl) return;

      // Check if click was on a map feature
      const features = map.current.queryRenderedFeatures(e.point);
      if (features?.length > 0) return;

      // Handle map click
      onMapClick(e);
    });
  }, []);

  return {
    mapContainer,
    map,
    lng,
    lat,
    zoom,
    mapboxToken,
    mapLoaded,
    addClickHandler,
  };
}
