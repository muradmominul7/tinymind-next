"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GridIcon, ListIcon } from "./icons";

const select =
  "rounded-lg border border-subtle bg-page px-3 py-2 text-heading outline-none focus:border-brand";

// Sort, items per page and grid/list view. Everything lives in the URL (?sort=&per_page=&view=),
// so the server renders the right products and the links can be shared.
export default function CategoryToolbar({ labels, sort, perPage, view, sortOptions, perPageOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(changes) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page"); // a new setting starts again from page 1
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

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
      <label className="flex items-center gap-2">
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

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
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
