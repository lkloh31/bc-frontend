import useQuery from "../api/useQuery";
import WeatherWidget from "./WeatherWidget";

export default function UserWeather() {
  // If your ApiProvider already prefixes with /api, "/weather/me" is correct.
  // Otherwise change to "/api/weather/me".
  const { data, loading, error } = useQuery("/daily/weather", "weather");

  if (loading) return <div className="ww-wrap">Loading weather…</div>;
  if (error)   return <div className="ww-wrap" style={{color:"salmon"}}>Error: {String(error)}</div>;
  if (!data)   return null;

  return <WeatherWidget serverData={data} />;
}