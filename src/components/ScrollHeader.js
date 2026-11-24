"use client";

import { useEffect, useRef, useState } from "react";

const TOP = 100; // near the top of the page the header is always shown in full
const MOVE = 6; // scroll movements smaller than this (in px) are ignored

// Sticky header. Scrolling down slides the top bar (desktop) or the logo row (phone) out of view;
// scrolling up, anywhere on the page, brings it back. The header keeps its place in the page flow,
// only its sticky offset changes, so the page never jumps.
export default function ScrollHeader({ children }) {
  const ref = useRef(null);
  const [compact, setCompact] = useState(false);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    // The part that slides away: the top bar on wide screens, the logo row on phones.
    const wide = window.matchMedia("(min-width: 768px)");
    const measure = () => {
      const part = header.querySelector(wide.matches ? "[data-hdr-top]" : "[data-hdr-row]");
      header.style.setProperty("--hdr-hide", `${part ? part.offsetHeight : 0}px`);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(header);
    wide.addEventListener("change", measure);

    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setStuck(y > 0);

      if (y <= TOP) {
        setCompact(false);
        last = Math.max(y, 0);
        return;
      }

      const diff = y - last;
      if (Math.abs(diff) < MOVE) return;
      setCompact(diff > 0);
      last = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      wide.removeEventListener("change", measure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={ref} className="hdr" data-compact={compact} data-stuck={stuck}>
      {children}
    </header>
  );
}
