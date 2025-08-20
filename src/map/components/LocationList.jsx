import LocationItem from "./LocationItem";

export default function LocationList({
  pins,
  type,
  onLocationClick,
  onDeleteLocation,
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
          onDelete={onDeleteLocation}
          locationTypes={locationTypes}
        />
      ))}
    </div>
  );
}
