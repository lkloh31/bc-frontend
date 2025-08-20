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

export default function MapPage() {
  const { token } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [locationTypes, setLocationTypes] = useState([
    "been_there",
    "want_to_go",
  ]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchResult, setSelectedSearchResult] = useState(null);

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
    setSelectedSearchResult(null);
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
      setShowAddForm(false);
      setSelectedLocation(null);
      setSelectedSearchResult(null);
      // Clear search results after adding pin
      setSearchResults([]);
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

  const handleDeleteLocationType = async (locationType) => {
    try {
      // First, delete all pins of this type
      const pinsToDelete = pins.filter(
        (pin) => pin.locationType === locationType
      );

      // Delete each pin
      for (const pin of pinsToDelete) {
        await handleDeletePin(pin.id);
      }

      // Remove the location type from the list
      setLocationTypes((prev) => prev.filter((type) => type !== locationType));
    } catch (error) {
      console.error("Failed to delete location type:", error);
      throw error;
    }
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

  // Handle search bar location selection - only fly to location and show marker
  const handleSearchLocationSelect = (locationData) => {
    // Fly to the selected location
    flyToLocation(locationData.lng, locationData.lat);

    // Set as selected search result for highlighting
    setSelectedSearchResult(locationData);

    // Create a single search result marker for the selected location
    const searchMarker = {
      id: `search-selected`,
      longitude: locationData.lng,
      latitude: locationData.lat,
      name: locationData.name || locationData.fullName,
      isSearchResult: true,
      searchData: locationData,
    };

    setSearchResults([searchMarker]);
  };

  // Handle search results (show temporary markers)
  const handleSearchResult = (results) => {
    // Convert search results to marker format
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

  const handleSidebarDeletePin = async (pinId) => {
    try {
      await handleDeletePin(pinId);
    } catch (error) {
      console.error("Error deleting pin from sidebar:", error);
      alert("Failed to delete location. Please try again.");
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
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLocationClick={flyToLocation}
        onDeleteLocation={handleSidebarDeletePin}
        locationTypes={locationTypes}
        onAddLocationType={handleAddLocationType}
        onDeleteLocationType={handleDeleteLocationType}
      />

      {showAddForm && (
        <AddPinModal
          onClose={() => {
            setShowAddForm(false);
            setSelectedLocation(null);
            setSelectedSearchResult(null);
          }}
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
