// useSavedLocations.js
import { useEffect, useState } from "react";
const KEY = "wx.savedLocations.v1";

// shape we store: { id, name, admin1, country, lat, lon, def?, t?, icon? }
export default function useSavedLocations() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const idOf = (p) => `${p.latitude},${p.longitude}`;

  function updateTemp(id, t) {
  if (!Number.isFinite(t)) return;
  setItems(prev =>
    prev.map(it => it.id === id ? { ...it, t, tUpdatedAt: Date.now() } : it)
    );
  }

  function add(place) {
    if (!place) return;
    const id = idOf(place);
    setItems(prev => prev.some(x => x.id === id)
      ? prev
      : [{ id, name: place.name, admin1: place.admin1, country: place.country, lat: place.latitude, lon: place.longitude }, ...prev].slice(0, 12)
    );
  }
  function remove(id) { setItems(prev => prev.filter(x => x.id !== id)); }
  function makeDefault(id) { setItems(prev => prev.map(x => ({ ...x, def: x.id === id }))); }
  function reorder(from, to) {
    setItems(prev => {
      const a = [...prev]; const [sp] = a.splice(from, 1);
      a.splice(Math.max(0, Math.min(to, a.length)), 0, sp);
      return a;
    });
  }
  function updateSnapshot(id, patch) {
    setItems(prev => prev.map(x => (x.id === id ? { ...x, ...patch } : x)));
  }

  return { items,updateTemp, add, remove, makeDefault, reorder, updateSnapshot, idOf };
}
