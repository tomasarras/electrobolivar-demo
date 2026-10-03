"use client";

import { Star } from "lucide-react";

export default function StarRating({ value, onChange, size = 20, readOnly = false }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star size={size} fill={n <= Math.round(value) ? "currentColor" : "none"} className={n <= Math.round(value) ? "text-accent" : "text-line"} />
        </button>
      ))}
    </div>
  );
}
