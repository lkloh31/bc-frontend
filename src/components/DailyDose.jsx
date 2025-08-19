import React, { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import { Link } from "react-router";
import "../styles/pages/daily.css";

const STORAGE_KEY = "daily-dose-links-order";

export default function DailyDose() {
  const defaultLinks = [
    { id: "news", label: "News", path: "/daily/news" },
    { id: "weather", label: "Weather", path: "/daily/weather" },
    { id: "exchange", label: "Exchange rates", path: "/daily/exchange" },
    { id: "stocks", label: "Stocks", path: "/daily/stocks" },
    { id: "crypto", label: "Cryptocurrency", path: "/daily/crypto" },
  ];

  // Load saved order or use default
  const [links, setLinks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const savedIds = JSON.parse(saved);
        const ordered = savedIds
          .map((id) => defaultLinks.find((link) => link.id === id))
          .filter(Boolean);
        const missing = defaultLinks.filter(
          (link) => !savedIds.includes(link.id)
        );
        return [...ordered, ...missing];
      } catch {
        return defaultLinks;
      }
    }
    return defaultLinks;
  });

  // Save order on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links.map((l) => l.id)));
  }, [links]);

  return (
    <div
      className="daily-dose"
      style={{ maxWidth: 400, margin: "auto", padding: 20 }}
    >
      <h1>Daily Intakes...</h1>
      <h2>Quick access to your personalized content.</h2>
      <h3>
        You’re in control — Customize the order of the links below to match what
        matters most to you.
      </h3>

      <Reorder.Group
        axis="y"
        values={links}
        onReorder={setLinks}
        className="daily-dose-links"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        {links.map((link) => (
          <Reorder.Item
            key={link.id}
            value={link}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              cursor: "grab",
              userSelect: "none",
              borderRadius: 6,
              border: "1px solid #ccc",
              backgroundColor: "white",
              textAlign: "center",
            }}
            whileDrag={{
              scale: 1.05,
              boxShadow: "0 5px 10px rgba(0,0,0,0.15)",
              cursor: "grabbing",
            }}
          >
            <Link
              to={link.path}
              style={{
                textDecoration: "none",
                color: "#333",
                display: "block",
              }}
              onClick={(e) => e.stopPropagation()} // Prevent drag interference on click
            >
              {link.label}
            </Link>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
