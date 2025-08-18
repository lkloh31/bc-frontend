// SavedLocationsBar.jsx
// import "./saved-locations.css";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import "../../styles/pages/weather/saved-locations.css";

export default function SavedLocationsBar({
  items, activeId, onSelect, onAdd, onRemove, onDefault
}) {
  const [openId, setOpenId] = useState(null);
  const [pos, setPos] = useState(null);
  const popRef = useRef(null);

  function openMenu(e, id) {
    e.stopPropagation();
    const br = e.currentTarget.getBoundingClientRect();
    const width = 180;
    const margin = 8;
    const approxMenuH = 90; // ~two items; good enough for placement

    const spaceBelow = window.innerHeight - br.bottom;
    const openDown = spaceBelow > approxMenuH + margin;

    const top = openDown
      ? br.bottom + margin
      : Math.max(margin, br.top - approxMenuH - margin);

    let left = br.right - width; // align right edges with the ⋯ button
    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

    setPos({ top, left, width });
    setOpenId(id);
  }

  useEffect(() => {
    if (!openId) return;
    const onKey = (ev) => ev.key === "Escape" && setOpenId(null);
    const onClick = (ev) => {
      if (popRef.current && popRef.current.contains(ev.target)) return;
      setOpenId(null);
    };
    window.addEventListener("click", onClick); 
    window.addEventListener("resize", onClick);
    window.addEventListener("scroll", onClick, true);
    window.addEventListener("keydown", onKey, true);

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onClick,true);
      window.removeEventListener("resize", onClick);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [openId]);
  
  return (
    <div
      className="wx-saved"
      role="navigation"
      aria-label="Saved locations"
      onClick={() => setOpenId(null)}
    >
      {items.map((x) => (
        <div
          key={x.id}
          className={`wx-chip ${x.id === activeId ? "is-active" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(x)}
          onKeyDown={(e) => e.key === "Enter" && onSelect(x)}
        >
          <div className="wx-chip-main">
            <span className="wx-chip-name">{x.name}</span>
            <span className="wx-chip-meta">
              {x.country?.slice(0, 2).toUpperCase()} {x.admin1 ? `· ${x.admin1}` : ""}
            </span>
          </div>
          <div className="wx-chip-right" onClick={(e) => e.stopPropagation()}>
            {x.def && <span className="wx-chip-star" aria-label="Default">★</span>}
            {Number.isFinite(x.t) && (
              <span className="wx-chip-temp">{Math.round(x.t)}°</span>
            )}
            <button
              className="wx-chip-menu"
              aria-label="More"
              onClick={(e) => openMenu(e, x.id)}
            >
              ⋯
            </button>
          </div>
        </div>
      ))}

      {/* Portal popover */}
      {openId && pos &&
        createPortal(
            <div
              ref={popRef}
              className="wx-pop"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
            {/* <button onClick={() => { onDefault(openId); setOpenId(null); }}>Set default</button> */}
            <button onClick={() => { onRemove(openId); setOpenId(null); }}>Remove</button>
          </div>,
          document.body
        )
      }
    </div>
  );
}
