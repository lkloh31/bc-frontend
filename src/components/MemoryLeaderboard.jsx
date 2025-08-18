import { useEffect, useMemo, useState } from "react";

/**
 * MemoryLeaderboard (plain styles, robust URLs)
 * Props:
 *  - apiBase?: string   e.g. "" or "http://localhost:3000" (no trailing slash)
 *  - prefix?: string    default "/games" (change if router is under /api/games)
 *  - limit?: number     default 10
 *  - showMe?: boolean   default true
 *  - refreshKey?: any   change to force reload
 */
export default function MemoryLeaderboard({
  apiBase = "",
  prefix = "/games",
  limit = 10,
  showMe = true,
  refreshKey,
}) {
  const [top, setTop] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // normalize base/prefix and build URLs
  const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  const pref = prefix.startsWith("/") ? prefix : `/${prefix}`;
  const topUrl = useMemo(
    () => `${base}${pref}/leaderboard/memory?limit=${encodeURIComponent(String(limit))}`,
    [base, pref, limit]
  );
  const meUrl = useMemo(() => `${base}${pref}/leaderboard/memory/me`, [base, pref]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Top list
        const resTop = await fetch(topUrl, { headers: { Accept: "application/json" } });
        if (!resTop.ok) {
          const txt = await resTop.text().catch(() => "");
          throw new Error(`Top HTTP ${resTop.status} ${resTop.statusText}${txt ? ` — ${txt}` : ""}`);
        }
        const dataTop = await resTop.json();
        if (!cancelled) setTop(Array.isArray(dataTop?.top) ? dataTop.top : []);

        // My rank (optional)
        if (showMe) {
          const token = localStorage.getItem("token");
          const resMe = await fetch(meUrl, {
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (resMe.ok) {
            const dataMe = await resMe.json();
            if (!cancelled) setMe(dataMe?.me ?? null);
          } else {
            if (!cancelled) setMe(null);
          }
        } else {
          if (!cancelled) setMe(null);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Could not load leaderboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [topUrl, meUrl, showMe, refreshKey]);

  const boxStyle = { width: 320, maxWidth: "100%", border: "1px solid #444", borderRadius: 12, padding: 16 };
  const smallMuted = { fontSize: 12, opacity: 0.7, marginBottom: 8 };
  const rowStyle = { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 };

  return (
    <div style={boxStyle}>
      <div style={{ fontWeight: 600 }}>🏆 Fastest Memory Match</div>
      <div style={smallMuted}>Lower time is better</div>

      {loading && <div style={{ fontSize: 14, opacity: 0.7 }}>Loading leaderboard…</div>}
      {!loading && error && <div style={{ fontSize: 14, color: "#e11d48" }}>{error}</div>}

      {!loading && !error && (
        <ol style={{ paddingLeft: 16, margin: 0 }}>
          {top.length === 0 && <li style={{ fontSize: 14, opacity: 0.7 }}>No scores yet — be the first!</li>}
          {top.map((row, idx) => {
            const rank = Number(row.rank ?? idx + 1);
            return (
              <li key={row.user_id ?? idx} style={rowStyle}>
                <span style={{ marginRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {rank}. {row.username ?? `User ${row.user_id ?? "?"}`}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatMs(row.time_ms)}</span>
              </li>
            );
          })}
        </ol>
      )}

      {me && !top.find((r) => r.user_id === me.user_id) && (
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: "1px solid #444" }}>
          <div style={smallMuted}>Your best</div>
          <div style={rowStyle}>
            <span>Rank #{Number(me.rank) || "?"}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatMs(me.time_ms)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function formatMs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n >= 2000) return `${(n / 1000).toFixed(2)} s`;
  return `${Math.round(n)} ms`;
}
