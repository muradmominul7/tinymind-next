"use client";

import { useState } from "react";
import CategoryToolbar from "./CategoryToolbar";
import FilterSidebar from "./FilterSidebar";

// Toolbar + (optional) filter sidebar + the product list passed in as children.
// The filter switch is off by default; it starts on only when filters are already in the URL.
export default function CategoryBrowser({ lang, labels, toolbar, filters, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const available = Boolean(filters);
  const showing = available && open;

  return (
    <>
      <CategoryToolbar
        {...toolbar}
        labels={labels}
        filter={available ? { open, onToggle: () => setOpen((o) => !o) } : null}
      />
      <div className={showing ? "grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]" : ""}>
        {showing && (
          <FilterSidebar lang={lang} labels={labels} groups={filters.groups} price={filters.price} />
        )}
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
