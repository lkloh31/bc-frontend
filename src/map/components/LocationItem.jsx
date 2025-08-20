import { getLocationColor } from "../utils/locationColors";

export default function LocationItem({
  pin,
  type,
  onClick,
  onDelete,
  locationTypes = [],
}) {
  const dotColor = getLocationColor(type, locationTypes);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(pin.id);
    }
  };

  return (
    <div className="location-item" onClick={onClick}>
      <div className="location-dot" style={{ backgroundColor: dotColor }}></div>
      <div className="location-info">
        <span className="location-name">{pin.name}</span>
        {pin.rating && <span className="location-rating">★{pin.rating}</span>}
      </div>
      <button
        className="delete-btn"
        onClick={handleDelete}
        aria-label={`Delete ${pin.name}`}
      >
        ×
      </button>
    </div>
  );
}
