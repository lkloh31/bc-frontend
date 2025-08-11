import { useRef, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";
import mapboxgl from "mapbox-gl";

import "../styles/pages/map.css";
import "../styles/components/button.css";

export default function MapPage() {
  const { token } = useAuth();
  const { request } = useApi();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-122.4194);
  const [lat, setLat] = useState(37.7749);
  const [zoom, setZoom] = useState(10);
  const [mapboxToken, setMapboxToken] = useState(null);

  // Get Mapbox token
  useEffect(() => {
    const getMapboxToken = async () => {
      if (!token || mapboxToken) return;

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
    if (map.current || !mapboxToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, [mapboxToken]);

  return (
    <div className="map-page">
      <div className="map-box">
        {!mapboxToken ? (
          <div className="map-message">Loading map...</div>
        ) : (
          <>
            <div ref={mapContainer} className="map-container" />
            <div className="map-info">
              Lng: {lng} | Lat: {lat} | Zoom: {zoom}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
