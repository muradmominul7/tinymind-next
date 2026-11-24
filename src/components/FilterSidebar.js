"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/product";
import { useUrlUpdate } from "./useUrlUpdate";

const thumb =
  "pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
  "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 " +
  "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand " +
  "[&::-moz-range-thumb]:bg-white";

// Two sliders on one track. The URL changes when a slider is released (not on every move).
function PriceFilter({ lang, labels, price, initial, onCommit }) {
  const [lo, setLo] = useState(initial[0]);
  const [hi, setHi] = useState(initial[1]);
  const span = Math.max(1, price.max - price.min);
  const step = price.max > 200 ? 10 : 1;
  const left = ((lo - price.min) / span) * 100;
  const right = 100 - ((hi - price.min) / span) * 100;
  const commit = () => onCommit(lo, hi);

  return (
    <div>
      <p className="mb-3 text-sm">
        {labels.priceRange}:{" "}
        <span className="font-semibold text-heading">
          {formatPrice(lo, lang)} – {formatPrice(hi, lang)}
        </span>
      </p>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded bg-subtle" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-brand"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          aria-label={labels.priceFrom}
          min={price.min}
          max={price.max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
        <input
          type="range"
          aria-label={labels.priceTo}
          min={price.min}
          max={price.max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          onPointerUp={commit}
          onKeyUp={commit}
          className={thumb}
        />
      </div>
    </div>
  );
}

export default function FilterSidebar({ lang, labels, groups, price }) {
  const { params, go } = useUrlUpdate();

  const urlPrice = params.get("price");
  const match = /^(\d+),(\d+)$/.exec(urlPrice ?? "");
  const initial = match
    ? [Math.max(price?.min ?? 0, Number(match[1])), Math.min(price?.max ?? Infinity, Number(match[2]))]
    : [price?.min ?? 0, price?.max ?? 0];

  const anyActive = Boolean(urlPrice) || groups.some((g) => params.get(g.code));

  function toggleOption(code, id) {
    const chosen = new Set((params.get(code) ?? "").split(",").filter(Boolean));
    if (chosen.has(id)) chosen.delete(id);
    else chosen.add(id);
    go({ [code]: chosen.size ? [...chosen].join(",") : null });
  }

  function clearAll() {
    go(Object.fromEntries([["price", null], ...groups.map((g) => [g.code, null])]));
  }

  const heading = "mb-3 text-lg font-bold text-heading";

  return (
    <aside className="space-y-6 rounded-xl border border-subtle p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-heading">{labels.filter}</h2>
        {anyActive && (
          <button type="button" onClick={clearAll} className="text-sm font-semibold text-brand underline">
            {labels.clearAll}
          </button>
        )}
      </div>

      {price && price.max > price.min && (
        <section className="border-t border-subtle pt-4">
          <h3 className={heading}>{labels.price}</h3>
          <PriceFilter
            key={urlPrice ?? "all"}
            lang={lang}
            labels={labels}
            price={price}
            initial={initial}
            onCommit={(lo, hi) => go({ price: lo <= price.min && hi >= price.max ? null : `${lo},${hi}` })}
          />
        </section>
      )}

      {groups.map((group) => {
        const chosen = new Set((params.get(group.code) ?? "").split(",").filter(Boolean));
        return (
          <section key={group.code} className="border-t border-subtle pt-4">
            <h3 className={heading}>{group.name}</h3>
            <ul className="space-y-2">
              {group.options.map((option) => {
                const id = String(option.id);
                return (
                  <li key={id}>
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={chosen.has(id)}
                        onChange={() => toggleOption(group.code, id)}
                        className="h-5 w-5 rounded border-brand-alt accent-brand"
                      />
                      <span>{option.label}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </aside>
  );
}
