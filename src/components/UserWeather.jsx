import { useState } from "react";
import useQuery from "../api/useQuery";
import LocationSearch from "./LocationSearch";
import WeatherWidget from "./WeatherWidget";
import "../styles/pages/weather.css";
import { useEffect } from "react";

const API_BASE = ("http://localhost:3000").replace(/\/$/, "");



export default function UserWeather() {
  useEffect(() => {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    const set = () =>
      document.documentElement.style.setProperty("--nav-h", `${nav.offsetHeight}px`);
    set();

    const ro = new ResizeObserver(set);
    ro.observe(nav);
    window.addEventListener("resize", set);
    return () => {
      window.removeEventListener("resize", set);
      ro.disconnect();
    };
  }, []);

  const { data: savedData, loading: loadingSaved, error: errorSaved } =
    useQuery("/daily/weather", "weather");

  const [units] = useState("metric");
  const [place, setPlace] = useState(null);
  const [data, setData] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorSearch, setErrorSearch] = useState("");

  async function handleSelect(p) {
    setPlace(p);
    setLoadingSearch(true);
    setErrorSearch("");
    setData(null);
    try {
      const url = `${API_BASE}/daily/weather?lat=${p.latitude}&lon=${p.longitude}&units=${units}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (e) {
      setErrorSearch(e.message || "Failed to load weather");
    } finally {
      setLoadingSearch(false);
    }
  }

  const activeData = place ? data : savedData;
  const title = place
    ? `Weather — ${place.name}${place.admin1 ? `, ${place.admin1}` : ""}, ${place.country}`
    : "Weather — My location";

  return (
    <div className="wx">
      {/* FIXED header */}
      <header className="wx__header">
        <h1 className="wx__title">Weather</h1>
        <LocationSearch onSelect={handleSelect} />
      </header>

      <div className="wx__spacer" aria-hidden="true" />

      <main className="wx__content">
        {/* Loading / error states */}
        {!place && loadingSaved && <p className="wx__status">Loading...</p>}
        {!place && errorSaved && <p className="wx__error">{String(errorSaved)}</p>}
        {place && loadingSearch && <p className="wx__status">Loading...</p>}
        {place && errorSearch && <p className="wx__error">{errorSearch}</p>}

        {/* Hint */}
        {!activeData && !(loadingSaved || loadingSearch) && (
          <p className="wx__hint">Search a city to see the forecast.</p>
        )}

        {/* Widget */}
        {activeData && <WeatherWidget data={activeData} units={units} title={title} />}

        {/* Reset */}
        {place && (
          <p className="wx__hint" style={{ textAlign: "center", marginTop: 12 }}>
            <button
              className="linklike"
              onClick={() => { setPlace(null); setData(null); }}
            >
              Reset to my saved location
            </button>
          </p>
        )}
      </main>
    </div>
  );
}