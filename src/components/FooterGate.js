"use client";

import { usePathname } from "next/navigation";

// The checkout page has no footer, so the visitor can finish the order without distractions.
export default function FooterGate({ children }) {
  const pathname = usePathname();
  if (/^\/[^/]+\/checkout\/?$/.test(pathname ?? "")) return null;
  return children;
}
