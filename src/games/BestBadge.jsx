export default function BestBadge({ best, label = "Best" }) {
  const display =
    best == null
      ? "—"
      : typeof best === "object"
      ? best.value
      : best;

  return (
    <div style={{ opacity: 0.8 }}>
      {label}: <strong>{display}</strong>
    </div>
  );
}
