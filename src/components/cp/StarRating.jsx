import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, size = 5, readonly = false }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`transition-colors`}
            style={{
              width: size * 4,
              height: size * 4,
              fill: n <= (hovered || value) ? '#ff8c00' : 'transparent',
              color: n <= (hovered || value) ? '#ff8c00' : '#444',
            }}
          />
        </button>
      ))}
    </div>
  );
}