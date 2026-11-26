"use client";

import { CART_DRAWER_OPEN } from "@/lib/cart-drawer-events";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./contact-widget.css";

const ICON = "/contact-widget/icons";

// Put this on a product page: the WhatsApp button then sends that product's name and link.
// Everywhere else the widget sends the default message.
export function ContactProduct({ name }) {
  useEffect(() => {
    window.TMC_PRODUCT = { name, url: window.location.href };
    return () => {
      delete window.TMC_PRODUCT;
    };
  }, [name]);

  return null;
}

function buildMessage(t) {
  const product = typeof window !== "undefined" ? window.TMC_PRODUCT : null;

  if (product?.name) {
    return t.waProductMessage
      .replace("{name}", product.name)
      .replace("{url}", product.url || window.location.href);
  }

  return t.waDefaultMessage;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // falls through to the old way below
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export default function ContactWidget({ config }) {
  const pathname = usePathname();
  const { position, whatsapp, messenger, phone, t, nudge } = config;
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [bubble, setBubble] = useState(null); // { channel, text } or null
  const rootRef = useRef(null);
  const openRef = useRef(false);
  const indexRef = useRef(0);
  const current = useRef(null);
  const links = useRef({});

  const hidden = /^\/[^/]+\/checkout(\/|$)/.test(pathname || "");

  useEffect(() => {
    openRef.current = open;
    if (open) setBubble(null);
  }, [open]);

  // Closes on a click outside, on Escape, on a page change, and when the cart drawer opens.
  useEffect(() => {
    const onClick = (event) => {
      if (openRef.current && rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onDrawer = () => setOpen(false);

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener(CART_DRAWER_OPEN, onDrawer);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(CART_DRAWER_OPEN, onDrawer);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The floating messages above the main button (only while the widget is closed).
  useEffect(() => {
    if (!nudge.enabled || !nudge.messages.length || hidden) return;

    const interval = Math.max(3000, nudge.interval);
    const visible = Math.max(1500, Math.min(nudge.visible, interval - 500));
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let hideTimer;

    const showNext = () => {
      if (openRef.current) return;
      const message = nudge.messages[indexRef.current % nudge.messages.length];
      indexRef.current += 1;
      current.current = message;
      setBubble(message);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setBubble(null), reduceMotion ? Math.min(visible, 2500) : visible);
    };

    const first = setTimeout(showNext, 900);
    const timer = setInterval(showNext, interval);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(timer);
    };
  }, [nudge, hidden]);

  const track = useCallback((channel) => {
    document.dispatchEvent(new CustomEvent("tmc_contact_click", { detail: { channel } }));
    if (typeof window.gtag === "function") window.gtag("event", "tmc_contact_click", { channel });
    if (typeof window.fbq === "function") window.fbq("trackCustom", "TMCContactClick", { channel });
  }, []);

  const onChannel = async (event, channel) => {
    if (channel === "whatsapp") {
      event.preventDefault();
      const text = buildMessage(t);
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    }

    if (channel === "messenger") {
      if (await copyText(buildMessage(t))) {
        setToast(true);
        setTimeout(() => setToast(false), 2600);
      }
    }

    track(channel);
  };

  if (hidden) return null;

  const items = [
    whatsapp && { channel: "whatsapp", href: `https://wa.me/${whatsapp}`, external: true },
    messenger && { channel: "messenger", href: messenger, external: true },
    phone && { channel: "call", href: `tel:${phone}`, external: false },
  ].filter(Boolean);

  return (
    <>
      <div
        ref={rootRef}
        data-tmc=""
        className={`tmc-launcher tmc-pos-${position}${open ? " tmc-open" : ""}`}
      >
        <div className="tmc-items">
          {items.map((item) => (
            <a
              key={item.channel}
              ref={(node) => {
                links.current[item.channel] = node;
              }}
              href={item.href}
              className={`tmc-item tmc-${item.channel}`}
              data-tmc-channel={item.channel}
              data-tmc-tooltip={t.channels[item.channel]}
              aria-label={t.channels[item.channel]}
              {...(item.external ? { target: "_blank", rel: "noopener" } : {})}
              onClick={(event) => onChannel(event, item.channel)}
            >
              <img className="tmc-icon-img" src={`${ICON}/${item.channel === "call" ? "phone" : item.channel}.svg`} alt="" />
            </a>
          ))}
        </div>

        <div className="tmc-main-wrap">
          <div
            className={`tmc-nudge${bubble ? ` tmc-nudge-${bubble.channel} tmc-nudge-show` : ""}`}
            aria-hidden={bubble ? "false" : "true"}
            onClick={() => bubble && links.current[bubble.channel]?.click()}
          >
            <span className="tmc-nudge-text">{bubble?.text ?? current.current?.text ?? ""}</span>
          </div>

          <button
            type="button"
            className="tmc-main"
            aria-label={open ? t.close : t.open}
            aria-expanded={open ? "true" : "false"}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="tmc-main-icon-default">
              <img className="tmc-icon-img" src={`${ICON}/help.svg`} alt="" />
            </span>
            <span className="tmc-main-icon-close">
              <img className="tmc-icon-img" src={`${ICON}/Close.svg`} alt="" />
            </span>
          </button>
        </div>
      </div>

      {toast && <div className="tmc-toast tmc-toast-show">{t.messengerCopyNotice}</div>}
    </>
  );
}
