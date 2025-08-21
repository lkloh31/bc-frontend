import { useState, useMemo, useEffect } from "react";
import StarRating from "./StarRating";

const DEFAULT_FORM_DATA = {
  name: "",
  address: "",
  notes: "",
  rating: "",
  locationType: "been_there",
};

export default function AddPinModal({
  onClose,
  onSubmit,
  isLoading,
  locationTypes = [],
  selectedLocation = null,
  searchData = null,
}) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Prefill form when searchData changes
  useEffect(() => {
    if (searchData) {
      setFormData((prev) => ({
        ...prev,
        name: searchData.name || searchData.fullName || "",
        address: searchData.address || "",
      }));
    }
  }, [searchData]);

  // Generate all location types with proper formatting
  const allLocationTypes = useMemo(() => {
    const baseTypes = [
      { value: "been_there", label: "Been There" },
      { value: "want_to_go", label: "Want to Go" },
    ];

    const customTypes = locationTypes
      .filter((type) => !["been_there", "want_to_go"].includes(type))
      .map((type) => ({
        value: type,
        label: type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }));

    return [...baseTypes, ...customTypes];
  }, [locationTypes]);

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
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

  const handleRatingChange = (rating) => {
    updateFormData("rating", rating.toString());
  };

  const isSubmitDisabled = isLoading || !formData.name.trim();

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              placeholder="Location name"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location-address">Address</label>
            <input
              id="location-address"
              type="text"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Address (optional)"
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
              onRatingChange={handleRatingChange}
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
            <button type="submit" disabled={isSubmitDisabled}>
              {isLoading ? "Adding..." : "Add Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
