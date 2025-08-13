import { useRef, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApi } from "../api/ApiContext";
import useQuery from "../api/useQuery";
import useMutation from "../api/useMutation";
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Get pins data - only if user is logged in
  const {
    data: pins = [],
    loading: pinsLoading,
    error: pinsError,
  } = useQuery(token ? "/map/pins" : null, "mapPins");

  // Add pin mutation
  const { mutate: addPin, loading: addingPin } = useMutation(
    "POST",
    "/map/pins",
    ["mapPins"]
  );

  // Delete pin mutation
  const { mutate: deletePin } = useMutation("DELETE", "", ["mapPins"]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    rating: "",
    locationType: "been_there",
  });

  // Get Mapbox token on component mount
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

      // Update coordinates when map moves
      map.current.on("move", () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      // Handle map clicks for adding pins
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setSelectedLocation({ lng, lat });
        setShowAddForm(true);
      });

      map.current.on("load", () => {
        setMapLoaded(true);
      });

      // Error handling
      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Add markers when pins data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !pins || pins.length === 0) return;

    console.log("Adding markers for pins:", pins); // Debug log

    // Clear existing markers
    const existingMarkers = document.querySelectorAll(".custom-marker");
    existingMarkers.forEach((marker) => marker.remove());

    pins.forEach((pin) => {
      console.log("Processing pin:", pin); // Debug each pin

      // Ensure coordinates are valid numbers
      const lng = parseFloat(pin.longitude);
      const lat = parseFloat(pin.latitude);

      if (isNaN(lng) || isNaN(lat)) {
        console.error("Invalid coordinates for pin:", pin);
        return;
      }

      const el = document.createElement("div");
      el.className = `custom-marker ${
        pin.locationType === "been_there"
          ? "been-there-marker"
          : "want-to-go-marker"
      }`;

      console.log("Creating marker at:", [lng, lat]); // Debug coordinates

      const marker = new mapboxgl.Marker(el)
        .setLngLat([pin.longitude, pin.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="marker-popup">
                <h3>${pin.name}</h3>
                ${
                  pin.address
                    ? `<p><strong>Address:</strong> ${pin.address}</p>`
                    : ""
                }
                ${
                  pin.notes ? `<p><strong>Notes:</strong> ${pin.notes}</p>` : ""
                }
                ${
                  pin.rating
                    ? `<p><strong>Rating:</strong> ${pin.rating}/5</p>`
                    : ""
                }
                <p><strong>Type:</strong> ${
                  pin.locationType === "been_there"
                    ? "Been There"
                    : "Want to Go"
                }</p>
                <button onclick="window.deletePin(${
                  pin.id
                })" class="delete-pin-btn">Delete</button>
              </div>
            `)
        )
        .addTo(map.current);

      console.log("Marker added successfully for:", pin.name);
    });
  }, [pins, mapLoaded]);

  const flyToLocation = (lng, lat) => {
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 12,
        essential: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setFormData({
        name: "",
        notes: "",
        rating: "",
        locationType: "been_there",
      });
    } catch (err) {
      console.error("Failed to add pin:", err);
      alert("Failed to add location. Please try again.");
    }
  };

  const handleDeletePin = async (pinId) => {
    if (window.confirm("Are you sure you want to delete this pin?")) {
      try {
        await request(`/map/pins/${pinId}`, {
          method: "DELETE",
        });
        // Force reload pins data
        window.location.reload();
      } catch (err) {
        console.error("Failed to delete pin:", err);
        alert("Failed to delete pin. Please try again.");
      }
    }
  };

  // Make delete function globally available for popup buttons
  useEffect(() => {
    window.deletePin = handleDeletePin;
    return () => {
      delete window.deletePin;
    };
  }, []);

  // Show loading or login required states
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
    console.error("Pins error:", pinsError);
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

  const beenTherePins = pins.filter((pin) => pin.locationType === "been_there");
  const wantToGoPins = pins.filter((pin) => pin.locationType === "want_to_go");

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
      <div className="map-sidebar">
        <div className="map-section been-there-section">
          <div className="section-title">
            been there ({beenTherePins.length})
          </div>
          <div className="location-list">
            {beenTherePins.map((pin) => (
              <div
                key={pin.id}
                className="location-item"
                onClick={() => flyToLocation(pin.longitude, pin.latitude)}
              >
                <div className="location-dot been-there-dot"></div>
                <div className="location-info">
                  <span className="location-name">{pin.name}</span>
                  {pin.rating && (
                    <span className="location-rating">★{pin.rating}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-section want-to-go-section">
          <div className="section-title">
            want to go ({wantToGoPins.length})
          </div>
          <div className="location-list">
            {wantToGoPins.map((pin) => (
              <div
                key={pin.id}
                className="location-item"
                onClick={() => flyToLocation(pin.longitude, pin.latitude)}
              >
                <div className="location-dot want-to-go-dot"></div>
                <div className="location-info">
                  <span className="location-name">{pin.name}</span>
                  {pin.rating && (
                    <span className="location-rating">★{pin.rating}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="map-instructions">
          <p>Click anywhere on the map to add a new location</p>
        </div>
      </div>

      {/* Add Pin Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowAddForm(false)}
            >
              ×
            </button>
            <h3>Add New Location</h3>
            <form onSubmit={handleSubmit} className="add-pin-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Location name"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.locationType}
                  onChange={(e) =>
                    setFormData({ ...formData, locationType: e.target.value })
                  }
                >
                  <option value="been_there">Been There</option>
                  <option value="want_to_go">Want to Go</option>
                </select>
              </div>

              <div className="form-group">
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  placeholder="Optional rating"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Optional notes"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={addingPin}>
                  {addingPin ? "Adding..." : "Add Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
