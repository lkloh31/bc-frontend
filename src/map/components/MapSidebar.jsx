import { useState, useMemo } from "react";
import LocationList from "./LocationList";

export default function MapSidebar({
  pins = [],
  pinsLoading = false,
  collapsed,
  onToggleCollapse,
  onLocationClick,
  onDeleteLocation,
  locationTypes = [],
  onAddLocationType,
  onDeleteLocationType,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  const categorizedPins = useMemo(() => {
    // Don't categorize if still loading
    if (pinsLoading || !pins) {
      return {
        been_there: [],
        want_to_go: [],
        custom: {},
      };
    }

    const categories = {
      been_there: [],
      want_to_go: [],
      custom: {},
    };

    pins.forEach((pin) => {
      if (pin.locationType === "been_there") {
        categories.been_there.push(pin);
      } else if (pin.locationType === "want_to_go") {
        categories.want_to_go.push(pin);
      } else {
        if (!categories.custom[pin.locationType]) {
          categories.custom[pin.locationType] = [];
        }
        categories.custom[pin.locationType].push(pin);
      }
    });

    return categories;
  }, [pins, pinsLoading]);

  const customTypes = useMemo(
    () =>
      locationTypes.filter(
        (type) => type !== "been_there" && type !== "want_to_go"
      ),
    [locationTypes]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) return;

    try {
      await onAddLocationType(newTypeName.trim());
      setNewTypeName("");
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to add location type:", error);
      alert(error.message || "Failed to add location type. Please try again.");
    }
  };

  const handleCancel = () => {
    setNewTypeName("");
    setShowAddForm(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      await onDeleteLocation(pinId);
    } catch (error) {
      console.error("Failed to delete pin:", error);
      alert("Failed to delete location. Please try again.");
    }
  };

  const handleDeleteLocationType = async (locationType) => {
    const typePins = categorizedPins.custom[locationType] || [];

    if (typePins.length > 0) {
      const confirmMessage = `This category has ${typePins.length} location(s). Deleting it will also delete all locations in this category. Are you sure?`;
      if (!window.confirm(confirmMessage)) {
        return;
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this category?")) {
        return;
      }
    }

    try {
      await onDeleteLocationType(locationType);
    } catch (error) {
      console.error("Failed to delete location type:", error);
      alert("Failed to delete category. Please try again.");
    }
  };

  // Render loading state
  if (pinsLoading) {
    return (
      <div className={`map-sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">My Places</div>
          <button
            className="sidebar-toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "📌" : "→"}
          </button>
        </div>

        {!collapsed && (
          <div className="sidebar-content">
            <div className="map-section">
              <div className="section-title">Loading...</div>
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                Loading your locations...
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`map-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-title">My Places</div>
        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "📌" : "→"}
        </button>
      </div>

      <div className="sidebar-content">
        {/* Default categories */}
        <div className="map-section been-there-section">
          <div className="section-title">
            been there ({categorizedPins.been_there.length})
          </div>
          <LocationList
            pins={categorizedPins.been_there}
            type="been_there"
            onLocationClick={onLocationClick}
            onDeleteLocation={handleDeletePin}
            locationTypes={locationTypes}
          />
        </div>

        <div className="map-section want-to-go-section">
          <div className="section-title">
            want to go ({categorizedPins.want_to_go.length})
          </div>
          <LocationList
            pins={categorizedPins.want_to_go}
            type="want_to_go"
            onLocationClick={onLocationClick}
            onDeleteLocation={handleDeletePin}
            locationTypes={locationTypes}
          />
        </div>

        {customTypes.map((locationType) => {
          const typePins = categorizedPins.custom[locationType] || [];
          const displayName = locationType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");

          return (
            <div key={locationType} className="map-section custom-section">
              <div className="section-header">
                <div className="section-title">
                  {displayName} ({typePins.length})
                </div>
                <button
                  className="delete-type-btn"
                  onClick={() => handleDeleteLocationType(locationType)}
                  aria-label={`Delete ${displayName} category`}
                  title={`Delete ${displayName} category`}
                >
                  ×
                </button>
              </div>
              <LocationList
                pins={typePins}
                type={locationType}
                onLocationClick={onLocationClick}
                onDeleteLocation={handleDeletePin}
                locationTypes={locationTypes}
              />
            </div>
          );
        })}

        <div className="map-section add-type-section">
          {!showAddForm ? (
            <button
              className="add-type-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add Category
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="add-type-form">
              <div className="input-container">
                <input
                  type="text"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Category name"
                  className="type-input"
                  autoFocus
                  maxLength={50}
                />
                <button
                  type="submit"
                  className="submit-arrow-btn"
                  disabled={!newTypeName.trim()}
                >
                  →
                </button>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn"
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        <div className="map-instructions">
          <p>Click anywhere on the map to add a new location</p>
        </div>
      </div>
    </div>
  );
}
