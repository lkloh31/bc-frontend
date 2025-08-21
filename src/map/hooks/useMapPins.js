import { useApi } from "../../api/ApiContext";
import useQuery from "../../api/useQuery";
import useMutation from "../../api/useMutation";

export function useMapPins(token, mapRef = null) {
  const { request, invalidateTags } = useApi();

  // Fetch pins data
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

  // Delete pin function
  const handleDeletePin = async (pinId) => {
    try {
      // Close any open popups if map is available
      if (mapRef?.current) {
        const openPopups = document.querySelectorAll(".mapboxgl-popup");
        openPopups.forEach((popup) => {
          const closeBtn = popup.querySelector(".mapboxgl-popup-close-button");
          closeBtn?.click();
        });
      }

      // Delete the pin
      await request(`/map/pins/${pinId}`, {
        method: "DELETE",
      });

      // Invalidate cache to refresh data
      invalidateTags(["mapPins"]);
    } catch (err) {
      console.error("Failed to delete pin:", err);
      throw new Error("Failed to delete pin. Please try again.");
    }
  };

  return {
    pins,
    pinsLoading,
    pinsError,
    addPin,
    addingPin,
    handleDeletePin,
  };
}
