"use client";

import { useState } from "react";
import { trackOrder } from "@/actions/track";

// Colors of the status badge. Everything not listed here uses the brand color.
const BADGE = {
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-red-100 text-red-800",
  refunded: "bg-red-100 text-red-800",
  partially_refunded: "bg-amber-100 text-amber-800",
  return_in_progress: "bg-amber-100 text-amber-800",
};

function Steps({ steps }) {
  if (steps.terminal_label || steps.current_index === null) return null;

  return (
    <ol className="mt-6 flex items-start">
      {steps.labels.map((label, i) => {
        const reached = i <= steps.current_index;

        return (
          <li key={label} className="relative flex-1 text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute left-[-50%] right-[50%] top-3 h-0.5 ${reached ? "bg-brand" : "bg-subtle"}`}
              />
            )}
            <span
              className={`relative mx-auto flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${
                reached ? "bg-brand" : "bg-subtle"
              }`}
            >
              {reached ? "\u2713" : ""}
            </span>
            <span className={`mt-2 block text-xs sm:text-sm ${reached ? "text-heading" : ""}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Result({ lang, order, onAgain }) {
  const when = new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="rounded-2xl border border-subtle p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-heading">{order.title}</h2>

      <p className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm">{order.labels.status}:</span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${BADGE[order.status_key] ?? "bg-brand/10 text-brand"}`}
        >
          {order.status_label}
        </span>
      </p>

      {order.shipped_via && <p className="mt-3 text-sm">{order.shipped_via}</p>}

      <Steps steps={order.steps} />

      {order.events.length > 0 && (
        <details className="mt-6 rounded-xl border border-subtle p-4">
          <summary className="cursor-pointer text-sm font-semibold text-heading">{order.labels.courier_updates}</summary>
          <ul className="mt-3 space-y-3">
            {order.events.map((event, i) => (
              <li key={`${event.occurred_at}-${i}`} className="border-l-2 border-brand-alt pl-3 text-sm">
                <p className="font-medium text-heading">
                  {event.title} <span className="font-normal">&middot; {event.courier}</span>
                </p>
                {event.occurred_at && <p className="text-xs">{when.format(new Date(event.occurred_at))}</p>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <button
        type="button"
        onClick={onAgain}
        className="mt-6 rounded-xl border-2 border-brand px-6 py-2.5 font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
      >
        {order.labels.track_another}
      </button>
    </div>
  );
}

// Order number + phone. The result texts come from the backend (already in the right language).
export default function TrackForm({ lang, labels }) {
  const [values, setValues] = useState({ orderNumber: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | failed
  const [problem, setProblem] = useState("");
  const [order, setOrder] = useState(null);

  const input =
    "w-full rounded-xl border border-subtle bg-page px-5 py-3.5 text-base text-heading outline-none transition-colors placeholder:text-body/60 focus:border-brand-alt";
  const label = "mb-1.5 block text-base text-heading";
  const small = "mt-1 text-sm text-red-600";

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;

    const found = {};
    if (!values.orderNumber.trim()) found.orderNumber = labels.errorOrder;
    if (!values.phone.trim()) found.phone = labels.errorPhone;
    setErrors(found);
    setProblem("");
    if (Object.keys(found).length) return;

    setStatus("sending");
    const result = await trackOrder({ lang, ...values });

    if (result.ok) {
      setOrder(result.order);
      setStatus("idle");
    } else {
      setProblem(result.message || labels.failed);
      setStatus("failed");
    }
  }

  function again() {
    setOrder(null);
    setValues({ orderNumber: "", phone: "" });
    setStatus("idle");
    setProblem("");
  }

  if (order) return <Result lang={lang} order={order} onAgain={again} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="track-order" className={label}>
          {labels.orderNumber} <span aria-hidden="true">*</span>
        </label>
        <input
          id="track-order"
          name="orderNumber"
          type="text"
          inputMode="numeric"
          value={values.orderNumber}
          onChange={set("orderNumber")}
          placeholder={labels.orderNumberPlaceholder}
          autoComplete="off"
          aria-invalid={Boolean(errors.orderNumber)}
          className={input}
        />
        {errors.orderNumber && <p className={small}>{errors.orderNumber}</p>}
      </div>

      <div>
        <label htmlFor="track-phone" className={label}>
          {labels.phone} <span aria-hidden="true">*</span>
        </label>
        <input
          id="track-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={set("phone")}
          placeholder={labels.phonePlaceholder}
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          className={input}
        />
        {errors.phone && <p className={small}>{errors.phone}</p>}
      </div>

      {problem && (
        <p role="alert" className={small}>
          {problem}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-brand px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-alt disabled:opacity-60 sm:w-96"
      >
        {status === "sending" ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
