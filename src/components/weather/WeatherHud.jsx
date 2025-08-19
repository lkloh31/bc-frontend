// WeatherHUD.jsx — minimal, legible overlay on the animated background
import "../../styles/pages/weather/weather-hud.css";

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
const codeToIcon  = (c)=>WMO[c]?.icon||"cloud";
const codeToLabel = (c)=>WMO[c]?.label||"—";
const r = (n)=>Math.round(n);
const toHour = (iso)=>new Date(iso).toLocaleTimeString([], { hour:"numeric" });
const toDay  = (iso)=>new Date(iso).toLocaleDateString([], { weekday:"short" });

function Icon({ name, className="whud-icon" }) {
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

export default function WeatherHUD({ data: dataProp, serverData, units="metric", title="Weather" }) {
  const data = dataProp || serverData;
  if (!data) return null;

  const c = data.current || {};
  const hourlyT   = data.hourly?.temperature_2m || [];
  const hourlyW   = data.hourly?.weather_code || [];
  const hourlyTime= data.hourly?.time || [];
  const dailyMin  = data.daily?.temperature_2m_min || [];
  const dailyMax  = data.daily?.temperature_2m_max || [];
  const dailyW    = data.daily?.weather_code || [];
  const dailyT    = data.daily?.time || [];

  const tz =
  data?.timezone ||
  data?.meta?.timezone ||
  data?.tz || undefined;

  const fmtDay = new Intl.DateTimeFormat([], { weekday: "short", timeZone: tz });
  const dayLabel = (i) => fmtDay.format(new Date(Date.now() + i * 24 * 60 * 60 * 1000));


  const todayHi = dailyMax[0], todayLo = dailyMin[0];
  const hours = (hourlyTime || []).map((t, i) => ({
    t,
    temp: hourlyT[i],
    w: hourlyW[i],
    }));

  
  const nowISO = data?.current?.time || data?.current_weather?.time || null;

  let start = 0;
  if (nowISO) {
    const idx = hours.findIndex(h => h.t >= nowISO);
    start = idx === -1 ? 0 : idx;
  } else {
    // Fallback (browser tz) if API didn't give a current time
    const idx = hours.findIndex(h => new Date(h.t) >= new Date());
    start = idx === -1 ? 0 : idx;
  }

  // Take the next 12 hours, wrapping if needed
  const next12 = (hours.slice(start).concat(hours)).slice(0, 12);

  // Helper: label hours without re-parsing dates (ISO is already in location tz)
  const hourLabel = (iso) => {
    const hh = parseInt(iso.slice(11, 13), 10);
    const h12 = ((hh + 11) % 12) + 1;
    return `${h12} ${hh < 12 ? "AM" : "PM"}`;
  };
  

  // Find the first hour at/after now
  // let start = hours.findIndex(h => new Date(h.t) >= now);
  // if (start === -1) start = 0;

// Take the next 12 hours, wrapping if needed
  // const next12 = (hours.slice(start).concat(hours)).slice(0, 12);

  const iconNow = codeToIcon(c.weather_code);

  return (
    <div className="whud">
      {/* Meta row */}
      <div className="whud-meta">
        <div className="whud-title">{title}</div>
        <div className="whud-dot">•</div>
        <div className="whud-time">
          {new Intl.DateTimeFormat([], {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
            timeZone: tz
          }).format(new Date())}
        </div>
        <div className="whud-today">
          <div className="whud-today-title">Today</div>
          <div className="whud-today-range">
            {Number.isFinite(todayHi) && Number.isFinite(todayLo) ? <>H: {r(todayHi)}° L: {r(todayLo)}°</> : "—"}
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="whud-hero">
        <div className="whud-temp">
          {r(c.temperature_2m ?? c.temperature ?? 0)}<span className="whud-unit">°{units === "metric" ? "C" : "F"}</span>
        </div>
        <div className="whud-desc">
          <Icon name={iconNow} className={`whud-icon cond-${iconNow}`} />
          <span>{codeToLabel(c.weather_code)}</span>
          <span className="whud-feels">Feels like {r(c.apparent_temperature ?? c.temperature_2m ?? 0)}°</span>
        </div>
      </div>

      {/* Hourly */}
      <section className="whud-hourly" aria-label="Hourly forecast">
        {next12.map((h, i) => {
          const ic = codeToIcon(h.w);
          return (
            <div
              key={h.t}
              className={`whud-chip cond-${ic}${i === 0 ? " is-active" : ""}`}
              title={codeToLabel(h.w)}
            >
              <div className="whud-chip-time">{i === 0 ? "Now" : hourLabel(h.t)}</div>
              <Icon name={ic} className={`whud-icon cond-${ic}`} />
              <div className="whud-chip-temp">{r(h.temp)}°</div>
            </div>
          );
        })}
      </section>

      {/* 7-day */}
      <section className="whud-7day" aria-label="7 day forecast">
        {dailyT.slice(0, 7).map((_, i) => {
          const ic = codeToIcon(dailyW[i]);
          const fill = Math.min(
            100,
            Math.max(0, (((dailyMax[i] ?? 0) - (dailyMin[i] ?? 0)) / 40) * 100)
          );
          const label = dayLabel(i); // today + i in the location timezone

          return (
            <div key={`${label}-${i}`} className={`whud-row${i === 0 ? " is-today" : ""}`}>
              <div className="whud-day">{label}</div>
              <div className="whud-mid">
                <Icon name={ic} className={`whud-icon cond-${ic}`} />
                <span className="whud-label">{codeToLabel(dailyW[i])}</span>
              </div>
              <div className="whud-bar">
                <div className="whud-bar-fill" style={{ "--fill": `${fill}%` }} />
              </div>
              <div className="whud-hi">{r(dailyMax[i])}°</div>
              <div className="whud-lo">{r(dailyMin[i])}°</div>
            </div>
          );
        })}
      </section>
    </div>
  );
}