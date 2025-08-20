import { useRef, useEffect, useState, useCallback } from "react";
import { useApi } from "../../api/ApiContext";
import mapboxgl from "mapbox-gl";

export function useMapbox(token) {
  const { request } = useApi();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const updateTimeoutRef = useRef(null);

  const [lng, setLng] = useState(-122.4194);
  const [lat, setLat] = useState(37.7749);
  const [zoom, setZoom] = useState(10);
  const [mapboxToken, setMapboxToken] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const updateCoordinates = () => {
    if (!map.current) return;

    setLng(map.current.getCenter().lng.toFixed(4));
    setLat(map.current.getCenter().lat.toFixed(4));
    setZoom(map.current.getZoom().toFixed(2));
  };

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

  useEffect(() => {
    if (map.current || !mapboxToken || !mapContainer.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // map.current.on("move", () => {
      //   if (updateTimeoutRef.current) {
      //     clearTimeout(updateTimeoutRef.current);
      //   }
      //   updateTimeoutRef.current = setTimeout(updateCoordinates, 100);
      // });

      // map.current.on("moveend", () => {
      //   if (updateTimeoutRef.current) {
      //     clearTimeout(updateTimeoutRef.current);
      //   }
      //   updateCoordinates();
      // });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

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
  }, [mapboxToken]);

  const addClickHandler = useCallback((onMapClick) => {
    if (!map.current) return;

    map.current.off("click");

    map.current.on("click", (e) => {
      if (window.hasOpenPopup && window.hasOpenPopup()) {
        window.closeAllPopups();
        return;
      }

      const clickedElement = e.originalEvent.target;
      const isMarkerOrControl =
        clickedElement &&
        (clickedElement.classList.contains("custom-marker") ||
          clickedElement.closest(".custom-marker") ||
          clickedElement.classList.contains("mapboxgl-marker") ||
          clickedElement.closest(".mapboxgl-marker") ||
          clickedElement.closest(".mapboxgl-ctrl") ||
          clickedElement.closest(".mapboxgl-popup"));

      if (isMarkerOrControl) return;

      const features = map.current.queryRenderedFeatures(e.point);
      if (features && features.length > 0) return;

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
