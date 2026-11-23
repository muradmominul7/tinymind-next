"use client";

import { useState } from "react";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  return (
    <div>
      <img
        src={images[active]}
        alt={name}
        className="w-full rounded-xl border border-subtle bg-page"
      />

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${name} ${i + 1}`}
                aria-current={i === active}
                className={`block overflow-hidden rounded-lg border-2 ${
                  i === active ? "border-brand" : "border-subtle"
                }`}
              >
                <img src={src} alt="" className="h-16 w-16 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
