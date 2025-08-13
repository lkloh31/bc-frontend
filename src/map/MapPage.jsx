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
                <label>Name *</label>
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
