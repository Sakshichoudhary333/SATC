import { useState } from 'react';

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div style={{ display: 'flex', gap: '4px', fontSize: '2rem', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db' }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          role="button"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
