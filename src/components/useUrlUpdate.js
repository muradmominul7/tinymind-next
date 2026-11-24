"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Changes some query parameters of the current page (null removes one) and always goes back to page 1.
export function useUrlUpdate() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(changes) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    next.delete("page");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return { params, go };
}
