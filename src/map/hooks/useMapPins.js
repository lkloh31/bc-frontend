import { useApi } from "../../api/ApiContext";
import useQuery from "../../api/useQuery";
import useMutation from "../../api/useMutation";

export function useMapPins(token, mapRef = null) {
  const { request, invalidateTags } = useApi();

  const {
    data: pins = [],
    loading: pinsLoading,
    error: pinsError,
  } = useQuery(token ? "/map/pins" : null, "mapPins");

  const { mutate: addPin, loading: addingPin } = useMutation(
    "POST",
    "/map/pins",
    ["mapPins"]
  );

  const handleDeletePin = async (pinId) => {
    try {
      if (mapRef && mapRef.current) {
        const popups = mapRef.current.queryRenderedFeatures();
        const openPopups = document.querySelectorAll(".mapboxgl-popup");
        openPopups.forEach((popup) => {
          const closeBtn = popup.querySelector(".mapboxgl-popup-close-button");
          if (closeBtn) closeBtn.click();
        });
      }

      await request(`/map/pins/${pinId}`, {
        method: "DELETE",
      });

      invalidateTags(["mapPins"]);
    } catch (err) {
      console.error("Failed to delete pin:", err);
      alert("Failed to delete pin. Please try again.");
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
