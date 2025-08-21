const COLOR_PALETTE = [
  "#10b981", // Green - been_there
  "#f59e0b", // Amber - want_to_go
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#ef4444", // Red
  "#6b7280", // Gray
];

const BUILT_IN_TYPES = {
  been_there: {
    color: COLOR_PALETTE[0],
    display: "Been There",
    class: "been-there-marker",
  },
  want_to_go: {
    color: COLOR_PALETTE[1],
    display: "Want to Go",
    class: "want-to-go-marker",
  },
  search_result: {
    color: "#3b82f6",
    display: "Search Result",
    class: "search-result-marker",
  },
};

// Get color for a specific location type
export function getLocationColor(locationType, locationTypes = []) {
  // Handle built-in types
  if (BUILT_IN_TYPES[locationType]) {
    return BUILT_IN_TYPES[locationType].color;
  }

  // Handle custom types
  const customTypes = locationTypes.filter(
    (type) => !["been_there", "want_to_go"].includes(type)
  );

  const typeIndex = customTypes.indexOf(locationType);
  // Start from index 2 (after built-in colors) for custom types
  const colorIndex = Math.min(typeIndex + 2, COLOR_PALETTE.length - 1);

  return COLOR_PALETTE[colorIndex];
}

// Get full configuration for a location type
export function getLocationConfig(locationType, locationTypes = []) {
  // Return built-in config if available
  if (BUILT_IN_TYPES[locationType]) {
    return BUILT_IN_TYPES[locationType];
  }

  // Generate config for custom types
  const formatDisplayName = (name) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  return {
    color: getLocationColor(locationType, locationTypes),
    display: formatDisplayName(locationType),
    class: "custom-marker",
  };
}

// Generate all marker configurations for MapContainer
export function generateMarkerConfigs(locationTypes = []) {
  const configs = { ...BUILT_IN_TYPES };

  const customTypes = locationTypes.filter(
    (type) => !["been_there", "want_to_go"].includes(type)
  );

  customTypes.forEach((type) => {
    configs[type] = getLocationConfig(type, locationTypes);
  });

  return configs;
}
