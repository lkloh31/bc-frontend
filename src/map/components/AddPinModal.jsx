import { useState, useMemo } from "react";
import StarRating from "./StarRating";

export default function AddPinModal({
  onClose,
  onSubmit,
  isLoading,
  locationTypes = [],
}) {
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    rating: "",
    locationType: "been_there",
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const allLocationTypes = useMemo(
    () => [
      { value: "been_there", label: "Been There" },
      { value: "want_to_go", label: "Want to Go" },
      ...locationTypes
        .filter((type) => type !== "been_there" && type !== "want_to_go")
        .map((type) => ({
          value: type,
          label: type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        })),
    ],
    [locationTypes]
  );

  const resetForm = () => {
    setFormData({
      name: "",
      notes: "",
      rating: "",
      locationType: "been_there",
    });
    setHoveredRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      resetForm();
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <h3>Add New Location</h3>

        <form onSubmit={handleSubmit} className="add-pin-form">
          <div className="form-group">
            <label htmlFor="location-name">Name</label>
            <input
              id="location-name"
              type="text"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              onKeyDown={handleKeyDown}
              required
              placeholder="Location name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location-category">Category</label>
            <select
              id="location-category"
              value={formData.locationType}
              onChange={(e) => updateFormData("locationType", e.target.value)}
              disabled={isLoading}
            >
              {allLocationTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Rating</label>
            <StarRating
              rating={parseInt(formData.rating) || 0}
              onRatingChange={(rating) =>
                updateFormData("rating", rating.toString())
              }
              hoveredRating={hoveredRating}
              onHover={setHoveredRating}
              onLeave={() => setHoveredRating(0)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location-notes">Notes</label>
            <textarea
              id="location-notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Optional notes"
              rows="3"
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Adding..." : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
