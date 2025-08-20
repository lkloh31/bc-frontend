import { useEffect, useRef, useState } from "react";
import "../../styles/pages/weather/weather-page.css";

async function geocode(q) {
  if (!q?.trim()) return [];
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = await res.json();
  return (json.results || []).map(r => ({
    id: String(r.id),
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export default function LocationSearch({ onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const t = useRef();

  useEffect(() => {
    clearTimeout(t.current);
    t.current = setTimeout(async () => {
      if (q.trim().length < 2) { setResults([]); return; }
      setResults(await geocode(q));
      setOpen(true);
    }, 250);
    return () => clearTimeout(t.current);
  }, [q]);

  const pick = (r) => {
    setQ(`${r.name}${r.admin1 ? `, ${r.admin1}` : ""}, ${r.country}`);
    setOpen(false);
    onSelect?.(r);
  };

  return (
    <div className="wx__search">
      <input
        className="wx__search-input"
        placeholder="Search location..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      <button className="wx__search-btn" type="button" onClick={() => results[0] && pick(results[0])} aria-label="Search">🔍</button>

      {open && results.length > 0 && (
        <ul className="wx__search-list" onMouseLeave={() => setOpen(false)}>
          {results.map(r => (
            <li key={r.id} className="wx__search-item" onClick={() => pick(r)}>
              <span className="wx__search-name">{r.name}</span>
              <span className="wx__search-meta">{r.admin1 ? `${r.admin1}, ` : ""}{r.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}