"use client";

import { useState } from "react";

// Thumbnails sit on the left on wide screens and below the main image on small screens.
export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);

  if (!images.length) return null;

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:pb-0">
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
                <img src={src} alt="" className="h-16 w-16 object-cover lg:h-20 lg:w-20" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <img
        src={images[active]}
        alt={name}
        className="min-w-0 flex-1 rounded-xl border border-subtle bg-page"
      />
    </div>
  );
}
