"use client";

import { useState } from "react";

const ZOOM = 2; // how much the picture grows while the mouse is over it

// Thumbnails sit on the left on wide screens and below the main image on small screens.
// With a mouse, the main image zooms smoothly toward the pointer. Touch screens do not zoom.
export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });

  if (!images.length) return null;

  function onMove(event) {
    if (event.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    setZoom({ on: true, x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  const onLeave = () => setZoom((z) => ({ ...z, on: false }));

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

      <div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={`min-w-0 flex-1 overflow-hidden rounded-xl border border-subtle bg-page ${
          zoom.on ? "cursor-zoom-in" : ""
        }`}
      >
        <img
          src={images[active]}
          alt={name}
          draggable={false}
          className="block w-full select-none"
          style={{
            transform: `scale(${zoom.on ? ZOOM : 1})`,
            transformOrigin: `${zoom.x}% ${zoom.y}%`,
            transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform-origin 0.15s ease-out",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
}
