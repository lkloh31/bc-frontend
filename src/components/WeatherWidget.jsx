import { useEffect, useMemo, useState } from "react";
// you said weather.css lives here:
import "../styles/pages/weather.css";

// --- WMO mapping helpers (Open-Meteo) ---
const WMO = {
  0:{label:"Clear",icon:"sun"},1:{label:"Mainly clear",icon:"sun"},
  2:{label:"Partly cloudy",icon:"cloudSun"},3:{label:"Overcast",icon:"cloud"},
  45:{label:"Fog",icon:"fog"},48:{label:"Rime fog",icon:"fog"},
  51:{label:"Light drizzle",icon:"drizzle"},53:{label:"Drizzle",icon:"drizzle"},55:{label:"Heavy drizzle",icon:"drizzle"},
  56:{label:"Freezing drizzle",icon:"sleet"},57:{label:"Freezing drizzle",icon:"sleet"},
  61:{label:"Light rain",icon:"rain"},63:{label:"Rain",icon:"rain"},65:{label:"Heavy rain",icon:"rain"},
  66:{label:"Freezing rain",icon:"sleet"},67:{label:"Freezing rain",icon:"sleet"},
  71:{label:"Light snow",icon:"snow"},73:{label:"Snow",icon:"snow"},75:{label:"Heavy snow",icon:"snow"},
  77:{label:"Snow grains",icon:"snow"},80:{label:"Light showers",icon:"rain"},
  81:{label:"Showers",icon:"rain"},82:{label:"Heavy showers",icon:"rain"},
  85:{label:"Snow showers",icon:"snow"},86:{label:"Heavy snow showers",icon:"snow"},
  95:{label:"Thunderstorm",icon:"storm"},96:{label:"Thunder w/ hail",icon:"storm"},99:{label:"Thunder w/ hail",icon:"storm"},
};
const codeToIcon = (c)=>WMO[c]?.icon||"cloud";
const codeToLabel = (c)=>WMO[c]?.label||"—";
const round = (n)=>Math.round(n);
const toHourLabel=(iso,now=new Date())=>{
  const d=new Date(iso);
  return Math.abs(d-now)<30*60*1000 ? "Now" : d.toLocaleTimeString([], {hour:"numeric"});
};
const toDayLabel=(iso)=>new Date(iso).toLocaleDateString([], {weekday:"short"});

// client-side fallback fetcher (only used if no serverData)
async function fetchWeather(lat, lon, units = "metric") {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,apparent_temperature,weather_code",
    hourly: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
    timezone: "auto",
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}

// tiny inline icon set (SVG)
function Icon({ name, className="ww-icon" }) {
  switch (name) {
    case "sun": return (<svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="4"/><g strokeLinecap="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></g></svg>);
    case "cloud": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2" strokeLinecap="round"/></svg>);
    case "cloudSun": return (<svg viewBox="0 0 24 24" className={className}><circle cx="6" cy="8" r="2"/><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2" strokeLinecap="round"/></svg>);
    case "rain": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" strokeLinecap="round"/></svg>);
    case "drizzle": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19v2M12 19v2M16 19v2" strokeLinecap="round"/></svg>);
    case "snow": return (<svg viewBox="0 0 24 24" className={className}><path d="M12 2v20M4 6l16 12M20 6L4 18" strokeLinecap="round"/></svg>);
    case "storm": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M11 13l-2 5 5-3-1.5 4" strokeLinecap="round"/></svg>);
    case "sleet": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19l1 2M12 19l1 2M16 19l1 2" strokeLinecap="round"/></svg>);
    case "fog": return (<svg viewBox="0 0 24 24" className={className}><path d="M4 10h16M2 14h20M6 18h12" strokeLinecap="round"/></svg>);
    default: return null;
  }
}

export default function WeatherWidget({ units = "metric", serverData }) {
  const [data, setData] = useState(serverData || null);
  const [loading, setLoading] = useState(!serverData);
  const [error, setError] = useState(null);

  // If server provides data (/api/weather/me), skip geolocation
  useEffect(() => {
    if (serverData) return;
    if (!navigator.geolocation) return;

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const d = await fetchWeather(pos.coords.latitude, pos.coords.longitude, units);
          setData(d);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
      },
      async () => {
        try {
          const d = await fetchWeather(37.7749, -122.4194, units); // SF fallback
          setData(d);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [serverData, units]);

  const now = new Date();

  const hourly = useMemo(() => {
    if (!data) return [];
    const idx = data.hourly.time.findIndex((t) => new Date(t) > now);
    const start = Math.max(0, idx - 1);
    return Array.from({ length: 12 })
      .map((_, i) => start + i)
      .filter((i) => i < data.hourly.time.length)
      .map((i) => ({
        time: data.hourly.time[i],
        temp: data.hourly.temperature_2m[i],
        code: data.hourly.weather_code[i],
      }));
  }, [data]);

  const daily = useMemo(() => {
    if (!data) return [];
    return data.daily.time.map((t, i) => ({
      date: t,
      tmin: data.daily.temperature_2m_min[i],
      tmax: data.daily.temperature_2m_max[i],
      code: data.daily.weather_code[i],
    }));
  }, [data]);

  const current = useMemo(() => {
    if (!data) return null;
    const c = data.current;
    return {
      temp: c.temperature_2m,
      feels: c.apparent_temperature,
      code: c.weather_code,
      label: codeToLabel(c.weather_code),
    };
  }, [data]);

  return (
    <div className="ww-wrap">
      <div className="ww-card">
        <div className="ww-top">
          <div>
            <span className="ww-title">Weather</span>
            <span className="ww-dot">•</span>
            <span className="ww-sub">
              {now.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <button className="ww-refresh" onClick={() => window.location.reload()}>Refresh</button>
        </div>

        <div className="ww-current">
          <div>
            <div className="ww-temp">
              {loading ? "—" : round(current?.temp)}<span className="ww-unit">°{units === "metric" ? "C" : "F"}</span>
            </div>
            <div className="ww-desc">
              <Icon name={codeToIcon(current?.code)} />
              <span>{current?.label ?? "Loading..."}</span>
            </div>
            {!loading && <div className="ww-feels">Feels like {round(current?.feels)}°</div>}
          </div>

          <div className="ww-today">
            <div className="ww-today-title">Today</div>
            {daily.length > 0
              ? <div className="ww-today-range">H: {round(daily[0].tmax)}° L: {round(daily[0].tmin)}°</div>
              : <div className="ww-today-range">—</div>}
          </div>
        </div>

        <div className="ww-section">
          <div className="ww-section-title">Hourly</div>
          <div className="ww-hourly">
            {loading ? <SkeletonChips /> : hourly.map((h) => (
              <div key={h.time} className="ww-chip">
                <div className="ww-chip-time">{toHourLabel(h.time, now)}</div>
                <Icon name={codeToIcon(h.code)} />
                <div className="ww-chip-temp">{round(h.temp)}°</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ww-section">
          <div className="ww-section-title">7-Day Forecast</div>
          <div className="ww-days">
            {loading ? <SkeletonRows /> : daily.slice(0, 7).map((d) => (
              <div key={d.date} className="ww-day">
                <div className="ww-day-name">{toDayLabel(d.date)}</div>
                <div className="ww-day-middle">
                  <Icon name={codeToIcon(d.code)} />
                  <span className="ww-day-label">{codeToLabel(d.code)}</span>
                </div>
                <div className="ww-day-temps">
                  <span className="ww-day-min">{round(d.tmin)}°</span>
                  <div className="ww-bar">
                    <div className="ww-bar-fill" style={{ width: `${Math.min(100, Math.max(0, ((d.tmax - d.tmin) / 40) * 100))}%` }} />
                  </div>
                  <span className="ww-day-max">{round(d.tmax)}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ww-footer">
          <span>Data by Open-Meteo</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">open-meteo.com</a>
        </div>

        {error && <div className="ww-error">Error: {String(error)}</div>}
      </div>
    </div>
  );
}

function SkeletonChips(){
  return (
    <>
      {Array.from({length:8}).map((_,i)=>(
        <div key={i} className="ww-chip ww-skel">
          <div className="ww-skel-line small" />
          <div className="ww-skel-circle" />
          <div className="ww-skel-line tiny" />
        </div>
      ))}
    </>
  );
}
function SkeletonRows(){
  return (
    <>
      {Array.from({length:7}).map((_,i)=>(
        <div key={i} className="ww-day ww-skel">
          <div className="ww-skel-line" />
        </div>
      ))}
    </>
  );
}