export default function LocationItem({
  pin,
  type,
  onClick,
  locationTypes = [],
}) {
  const getMarkerColor = (locationType) => {
    const colors = [
      "#10b981",
      "#f59e0b",
      "#6366f1",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ef4444",
      "#6b7280",
    ];

    if (locationType === "been_there") return colors[0];
    if (locationType === "want_to_go") return colors[1];

    const customTypes = locationTypes.filter(
      (type) => type !== "been_there" && type !== "want_to_go"
    );
    const typeIndex = customTypes.indexOf(locationType);
    return colors[Math.min(typeIndex + 2, colors.length - 1)];
  };

  const dotColor = getMarkerColor(type);

  return (
    <div className="location-item" onClick={onClick}>
      <div className="location-dot" style={{ backgroundColor: dotColor }}></div>
      <div className="location-info">
        <span className="location-name">{pin.name}</span>
        {pin.rating && <span className="location-rating">★{pin.rating}</span>}
      </div>
    </div>
  );
}
