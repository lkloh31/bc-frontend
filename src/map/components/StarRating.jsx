const STARS = [1, 2, 3, 4, 5];

export default function StarRating({
  rating,
  onRatingChange,
  hoveredRating,
  onHover,
  onLeave,
  disabled = false,
}) {
  const handleStarClick = (star) => {
    if (!disabled) {
      onRatingChange(star);
    }
  };

  const handleStarHover = (star) => {
    if (!disabled) {
      onHover(star);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      onLeave();
    }
  };

  return (
    <div className="star-rating">
      {STARS.map((star) => {
        const isHovered = hoveredRating >= star;
        const isFilled = rating >= star;
        const shouldShowFilled = isHovered || (isFilled && !hoveredRating);

        return (
          <span
            key={star}
            className={`star ${shouldShowFilled ? "filled" : ""}`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            onMouseLeave={handleMouseLeave}
            style={{
              color: shouldShowFilled ? "#fbbf24" : "#d1d5db",
              cursor: disabled ? "default" : "pointer",
            }}
          >
            {shouldShowFilled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}
