import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";

import MapContainer from "./components/MapContainer";
import MapSidebar from "./components/MapSidebar";
import AddPinModal from "./components/AddPinModal";
import MapSearchBar from "./components/MapSearchBar";
import { useMapbox } from "./hooks/useMapbox";
import { useMapPins } from "./hooks/useMapPins";

import "mapbox-gl/dist/mapbox-gl.css";

import "../styles/pages/map/map-layout.css";
import "../styles/pages/map/map-markers.css";
import "../styles/pages/map/map-popups.css";
import "../styles/pages/map/map-search-bar.css";
import "../styles/pages/map/map-sidebar.css";
import "../styles/pages/map/map-forms.css";

const DEFAULT_LOCATION_TYPES = ["been_there", "want_to_go"];

export default function MapPage() {
  const { token } = useAuth();

  // State management
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [locationTypes, setLocationTypes] = useState(DEFAULT_LOCATION_TYPES);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);

  // Custom hooks
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

  // Update location types when pins change
  useEffect(() => {
    if (pins?.length > 0) {
      const uniqueTypes = [...new Set(pins.map((pin) => pin.locationType))];
      setLocationTypes((prev) => {
        const allTypes = [...new Set([...prev, ...uniqueTypes])];
        return allTypes;
      });
    }
  }, [pins]);

  // Map click handler
  const handleMapClick = useCallback((e) => {
    const { lng, lat } = e.lngLat;
    setSelectedLocation({ lng, lat });
    setSelectedSearchResult(null);
    setShowAddForm(true);
  }, []);

  // Add map click handler when map is loaded
  useEffect(() => {
    if (!mapLoaded) return;
    addClickHandler(handleMapClick);
  }, [mapLoaded, addClickHandler, handleMapClick]);

  // Pin management functions
  const handleAddPin = async (formData) => {
    if (!selectedLocation) return;

    const pinData = {
      name: formData.name,
      address: formData.address || "",
      notes: formData.notes,
      rating: formData.rating ? parseInt(formData.rating) : null,
      locationType: formData.locationType,
      visitedDate: null,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
    };

    try {
      await addPin(pinData);
      closeAddForm();
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to add pin:", err);
      alert("Failed to add location. Please try again.");
    }
  };

  const handleAddLocationType = async (newTypeName) => {
    const normalizedName = newTypeName.toLowerCase().replace(/\s+/g, "_");

    if (locationTypes.includes(normalizedName)) {
      throw new Error("This category already exists");
    }

    setLocationTypes((prev) => [...prev, normalizedName]);
    return normalizedName;
  };

  const handleDeleteLocationType = async (locationType) => {
    try {
      // Delete all pins of this type
      const pinsToDelete = pins.filter(
        (pin) => pin.locationType === locationType
      );

      for (const pin of pinsToDelete) {
        await handleDeletePin(pin.id);
      }

      // Remove the location type
      setLocationTypes((prev) => prev.filter((type) => type !== locationType));
    } catch (error) {
      console.error("Failed to delete location type:", error);
      throw error;
    }
  };

  const handleSidebarDeletePin = async (pinId) => {
    try {
      await handleDeletePin(pinId);
    } catch (error) {
      console.error("Error deleting pin from sidebar:", error);
      alert("Failed to delete location. Please try again.");
    }
  };

  // Navigation functions
  const flyToLocation = (lng, lat) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  // Search functions
  const handleSearchLocationSelect = (locationData) => {
    flyToLocation(locationData.lng, locationData.lat);
    setSelectedSearchResult(locationData);

    const searchMarker = {
      id: "search-selected",
      longitude: locationData.lng,
      latitude: locationData.lat,
      name: locationData.name || locationData.fullName,
      isSearchResult: true,
      searchData: locationData,
    };

    setSearchResults([searchMarker]);
  };

  const handleSearchResult = (results) => {
    const searchMarkers = results.map((result, index) => ({
      id: `search-${index}`,
      longitude: result.center[0],
      latitude: result.center[1],
      name: result.text || result.place_name,
      isSearchResult: true,
      searchData: result,
    }));

    setSearchResults(searchMarkers);
    setSelectedSearchResult(null);
  };

  const handleSearchMarkerClick = (searchMarker) => {
    setSelectedSearchResult(searchMarker.searchData);
    setSelectedLocation({
      lng: searchMarker.longitude,
      lat: searchMarker.latitude,
      searchData: searchMarker.searchData,
    });
    setShowAddForm(true);
  };

  // Form management
  const closeAddForm = () => {
    setShowAddForm(false);
    setSelectedLocation(null);
    setSelectedSearchResult(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Error states
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
        searchResults={searchResults}
        selectedSearchResult={selectedSearchResult}
        mapLoaded={mapLoaded}
        map={map}
        onDeletePin={handleDeletePin}
        onSearchMarkerClick={handleSearchMarkerClick}
        locationTypes={locationTypes}
      />

      <MapSearchBar
        mapboxToken={mapboxToken}
        onLocationSelect={handleSearchLocationSelect}
        onSearchResult={handleSearchResult}
      />

      <MapSidebar
        pins={pins}
        pinsLoading={pinsLoading}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        onLocationClick={flyToLocation}
        onDeleteLocation={handleSidebarDeletePin}
        locationTypes={locationTypes}
        onAddLocationType={handleAddLocationType}
        onDeleteLocationType={handleDeleteLocationType}
      />

      {showAddForm && (
        <AddPinModal
          onClose={closeAddForm}
          onSubmit={handleAddPin}
          isLoading={addingPin}
          locationTypes={locationTypes}
          selectedLocation={selectedLocation}
          searchData={selectedLocation?.searchData}
        />
      )}
    </div>
  );
}
