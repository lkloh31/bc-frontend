import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

import MapContainer from "./components/MapContainer";
import MapSidebar from "./components/MapSidebar";
import AddPinModal from "./components/AddPinModal";
import { useMapbox } from "./hooks/useMapbox";
import { useMapPins } from "./hooks/useMapPins";

import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/pages/map.css";
import "../styles/components/button.css";

export default function MapPage() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [locationTypes, setLocationTypes] = useState([
    "been_there",
    "want_to_go",
  ]);

  const {
    mapContainer,
    map,
    lng,
    lat,
    zoom,
    mapboxToken,
    mapLoaded,
    addClickHandler,
  } = useMapbox(token);

  const { pins, pinsLoading, pinsError, addPin, addingPin, handleDeletePin } =
    useMapPins(token, map);

  useEffect(() => {
    if (pins && pins.length > 0) {
      const uniqueTypes = [...new Set(pins.map((pin) => pin.locationType))];
      const allTypes = [...new Set([...locationTypes, ...uniqueTypes])];
      setLocationTypes(allTypes);
    }
  }, [pins]);

  const handleMapClick = useCallback((e) => {
    const { lng, lat } = e.lngLat;
    setSelectedLocation({ lng, lat });
    setShowAddForm(true);
  }, []);

  useEffect(() => {
    if (!mapLoaded) return;

    addClickHandler(handleMapClick);
  }, [mapLoaded, addClickHandler, handleMapClick]);

  const handleAddPin = async (formData) => {
    if (!selectedLocation) return;

    const pinData = {
      name: formData.name,
      address: "",
      notes: formData.notes,
      rating: formData.rating ? parseInt(formData.rating) : null,
      locationType: formData.locationType,
      visitedDate: null,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
    };

    try {
      await addPin(pinData);
      setShowAddForm(false);
      setSelectedLocation(null);
    } catch (err) {
      console.error("Failed to add pin:", err);
      alert("Failed to add location. Please try again.");
    }
  };

  const handleAddLocationType = async (newTypeName) => {
    if (locationTypes.includes(newTypeName.toLowerCase())) {
      throw new Error("This category already exists");
    }
    const newType = newTypeName.toLowerCase().replace(/\s+/g, "_");
    setLocationTypes((prev) => [...prev, newType]);

    return newType;
  };

  const flyToLocation = (lng, lat) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  if (!token) {
    return (
      <div className="map-page">
        <div className="map-box">
          <div className="map-message">Please log in to view your map</div>
        </div>
      </div>
    );
  }

  if (pinsError) {
    return (
      <div className="map-page">
        <div className="map-box">
          <div className="map-message error">
            Error loading map data: {pinsError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-page">
      <MapContainer
        mapContainer={mapContainer}
        mapboxToken={mapboxToken}
        lng={lng}
        lat={lat}
        zoom={zoom}
        pins={pins}
        mapLoaded={mapLoaded}
        map={map}
        onDeletePin={handleDeletePin}
        locationTypes={locationTypes}
      />

      <MapSidebar
        pins={pins}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLocationClick={flyToLocation}
        locationTypes={locationTypes}
        onAddLocationType={handleAddLocationType}
      />

      {showAddForm && (
        <AddPinModal
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddPin}
          isLoading={addingPin}
          locationTypes={locationTypes}
        />
      )}
    </div>
  );
}
