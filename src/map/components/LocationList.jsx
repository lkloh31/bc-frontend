import LocationItem from "./LocationItem";

export default function LocationList({
  pins,
  type,
  onLocationClick,
  locationTypes = [],
}) {
  return (
    <div className="location-list">
      {pins.map((pin) => (
        <LocationItem
          key={pin.id}
          pin={pin}
          type={type}
          onClick={() => onLocationClick(pin.longitude, pin.latitude)}
          locationTypes={locationTypes}
        />
      ))}
    </div>
  );
}
