export default function StarRating({
  rating,
  onRatingChange,
  hoveredRating,
  onHover,
  onLeave,
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${
            star <= (hoveredRating || rating) ? "filled" : ""
          }`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={onLeave}
        >
          ⭐️
        </span>
      ))}
      {(rating > 0 || hoveredRating > 0) && (
        <span
          className="rating-text"
          style={{ marginLeft: "8px", fontSize: "14px", color: "#666" }}
        >
          {hoveredRating || rating}/5
        </span>
      )}
    </div>
  );
}
