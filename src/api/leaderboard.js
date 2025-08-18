const API_BASE = import.meta.env.VITE_API_URL || "";

function authHeaders() {
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function getMemoryLeaderboard(limit = 10, includeSelf = true) {
  const url = new URL(`${API_BASE}/games/leaderboard/memory`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("includeSelf", includeSelf ? "true" : "false");
  const res = await fetch(url.toString(), { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return res.json(); // { game, top, me }
}
