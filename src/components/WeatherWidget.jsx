
import "../styles/pages/weather.css";

const WMO = {
  0:{label:"Clear",icon:"sun"},1:{label:"Mainly clear",icon:"sun"},
  2:{label:"Partly cloudy",icon:"cloudSun"},3:{label:"Overcast",icon:"cloud"},
  45:{label:"Fog",icon:"fog"},48:{label:"Rime fog",icon:"fog"},
  51:{label:"Light drizzle",icon:"drizzle"},53:{label:"Drizzle",icon:"drizzle"},55:{label:"Heavy drizzle",icon:"drizzle"},
  56:{label:"Freezing drizzle",icon:"sleet"},57:{label:"Freezing drizzle",icon:"sleet"},
  61:{label:"Light rain",icon:"rain"},63:{label:"Rain",icon:"rain"},65:{label:"Heavy rain",icon:"rain"},
  66:{label:"Freezing rain",icon:"sleet"},67:{label:"Freezing rain",icon:"sleet"},
  71:{label:"Light snow",icon:"snow"},73:{label:"Snow",icon:"snow"},75:{label:"Heavy snow",icon:"snow"},
  77:{label:"Snow grains",icon:"snow"},
  80:{label:"Light showers",icon:"rain"},81:{label:"Showers",icon:"rain"},82:{label:"Heavy showers",icon:"rain"},
  85:{label:"Snow showers",icon:"snow"},86:{label:"Heavy snow showers",icon:"snow"},
  95:{label:"Thunderstorm",icon:"storm"},96:{label:"Thunder w/ hail",icon:"storm"},99:{label:"Thunder w/ hail",icon:"storm"},
};
const codeToIcon = (c)=>WMO[c]?.icon||"cloud";
const codeToLabel = (c)=>WMO[c]?.label||"—";
const r = (n)=>Math.round(n);
const toHour = (iso)=>new Date(iso).toLocaleTimeString([], { hour:"numeric" });
const toDay  = (iso)=>new Date(iso).toLocaleDateString([], { weekday:"short" });

function Icon({ name, className="ww-icon" }) {
  switch (name) {
    case "sun":     return (<svg viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="4"/><g strokeLinecap="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></g></svg>);
    case "cloud":   return (<svg viewBox="0 0 24 24" className={className}><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2" strokeLinecap="round"/></svg>);
    case "cloudSun":return (<svg viewBox="0 0 24 24" className={className}><circle cx="6" cy="8" r="2"/><path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2" strokeLinecap="round"/></svg>);
    case "rain":    return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" strokeLinecap="round"/></svg>);
    case "drizzle": return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19v2M12 19v2M16 19v2" strokeLinecap="round"/></svg>);
    case "snow":    return (<svg viewBox="0 0 24 24" className={className}><path d="M12 2v20M4 6l16 12M20 6L4 18" strokeLinecap="round"/></svg>);
    case "storm":   return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M11 13l-2 5 5-3-1.5 4" strokeLinecap="round"/></svg>);
    case "sleet":   return (<svg viewBox="0 0 24 24" className={className}><path d="M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2"/><path d="M8 19l1 2M12 19l1 2M16 19l1 2" strokeLinecap="round"/></svg>);
    case "fog":     return (<svg viewBox="0 0 24 24" className={className}><path d="M4 10h16M2 14h20M6 18h12" strokeLinecap="round"/></svg>);
    default:        return null;
  }
}

export default function WeatherWidget({ data: dataProp, serverData, units="metric", title="Weather" }) {
  const data = dataProp || serverData;
  if (!data) return null;

  const c = data.current || {};
  const hourlyT = data.hourly?.temperature_2m || [];
  const hourlyW = data.hourly?.weather_code || [];
  const hourlyTime = data.hourly?.time || [];
  const dailyMin = data.daily?.temperature_2m_min || [];
  const dailyMax = data.daily?.temperature_2m_max || [];
  const dailyW   = data.daily?.weather_code || [];
  const dailyT   = data.daily?.time || [];

  const todayHi = dailyMax[0], todayLo = dailyMin[0];

  return (
    <div className="ww-wrap">
      <div className="ww-card">
        <div className="ww-top">
          <div>
            <span className="ww-title">{title}</span>
            <span className="ww-dot">•</span>
            <span className="ww-sub">
              {new Date().toLocaleString([], { weekday:"short", hour:"numeric", minute:"2-digit" })}
            </span>
          </div>
        </div>

        <div className="ww-current">
          <div>
            <div className="ww-temp">
              {r(c.temperature_2m ?? c.temperature ?? 0)}
              <span className="ww-unit">°{units === "metric" ? "C" : "F"}</span>
            </div>
            <div className="ww-desc">
              <Icon name={codeToIcon(c.weather_code)} />
              <span>{codeToLabel(c.weather_code)}</span>
            </div>
            <div className="ww-feels">
              Feels like {r(c.apparent_temperature ?? c.temperature_2m ?? 0)}°
            </div>
          </div>

          <div className="ww-today">
            <div className="ww-today-title">Today</div>
            <div className="ww-today-range">
              {Number.isFinite(todayHi) && Number.isFinite(todayLo)
                ? <>H: {r(todayHi)}° L: {r(todayLo)}°</>
                : "—"}
            </div>
          </div>
        </div>

        <div className="ww-section">
          <div className="ww-section-title">Hourly</div>
          <div className="ww-hourly">
            {hourlyTime.slice(0, 12).map((t, i) => (
              <div key={t} className="ww-chip">
                <div className="ww-chip-time">{toHour(t)}</div>
                <Icon name={codeToIcon(hourlyW[i])} />
                <div className="ww-chip-temp">{r(hourlyT[i])}°</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ww-section">
          <div className="ww-section-title">7-Day Forecast</div>
          <div className="ww-days">
            {dailyT.slice(0, 7).map((d, i) => (
              <div key={d} className="ww-day">
                <div className="ww-day-name">{toDay(d)}</div>
                <div className="ww-day-middle">
                  <Icon name={codeToIcon(dailyW[i])} />
                  <span className="ww-day-label">{codeToLabel(dailyW[i])}</span>
                </div>
                <div className="ww-day-temps">
                  <span className="ww-day-min">{r(dailyMin[i])}°</span>
                  <div className="ww-bar">
                    <div
                      className="ww-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(0, (((dailyMax[i] ?? 0) - (dailyMin[i] ?? 0)) / 40) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="ww-day-max">{r(dailyMax[i])}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ww-footer">
          <span>Data by Open-Meteo</span>
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">open-meteo.com</a>
        </div>
      </div>
    </div>
  );
}