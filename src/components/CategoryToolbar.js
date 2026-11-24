"use client";

import { GridIcon, ListIcon } from "./icons";
import { useUrlUpdate } from "./useUrlUpdate";

const select =
  "rounded-lg border border-subtle bg-page px-3 py-2 text-heading outline-none focus:border-brand";

// Filter switch, sort, items per page and grid/list view. Sort, page size and view live in the URL
// (?sort=&per_page=&view=), so the server renders the right products and the links can be shared.
export default function CategoryToolbar({
  labels,
  sort,
  perPage,
  view,
  sortOptions,
  perPageOptions,
  filter,
}) {
  const { go } = useUrlUpdate();

  const viewButton = (name, Icon, text) => (
    <button
      type="button"
      aria-label={text}
      aria-pressed={view === name}
      onClick={() => go({ view: name === "grid" ? null : name })}
      className={`rounded-lg p-2 ${view === name ? "bg-brand text-white" : "text-heading hover:bg-secondary"}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-4">
        {filter && (
          <button
            type="button"
            role="switch"
            aria-checked={filter.open}
            onClick={filter.onToggle}
            className="flex items-center gap-2 font-medium text-heading"
          >
            <span
              className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                filter.open ? "bg-brand" : "bg-subtle"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  filter.open ? "translate-x-5" : ""
                }`}
              />
            </span>
            {labels.filter}
          </button>
        )}

        <label>
          <span className="sr-only">{labels.sort}</span>
          <select
            value={sort}
            onChange={(e) => go({ sort: e.target.value === sortOptions[0].value ? null : e.target.value })}
            className={select}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <label>
          <span className="sr-only">{labels.perPage}</span>
          <select
            value={perPage}
            onChange={(e) => go({ per_page: Number(e.target.value) === perPageOptions[0] ? null : e.target.value })}
            className={select}
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          {viewButton("list", ListIcon, labels.listView)}
          {viewButton("grid", GridIcon, labels.gridView)}
        </div>
      </div>
    </div>
  );
}
