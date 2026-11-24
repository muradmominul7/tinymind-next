"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { placeOrder, quoteDelivery } from "@/actions/checkout";
import { announceCart } from "@/lib/cart-events";
import { phoneProblem, validateCheckout } from "@/lib/checkout";
import { formatPrice } from "@/lib/product";

// Colourful fields: teal border with a thicker bottom edge.
const input =
  "w-full rounded-xl border border-brand-alt border-b-[3px] bg-page px-4 py-2.5 text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand-alt/30";

const buttonClass =
  "w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-alt disabled:opacity-60";

export default function CheckoutForm({ lang, labels, districts, summary }) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", phone: "", district: "", address: "" });
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [failed, setFailed] = useState(null);
  const [delivery, setDelivery] = useState({ status: "loading", price: 0 });
  const [pending, start] = useTransition();
  const latest = useRef("");

  const set = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));

  // Asks the shop for the delivery charge. An empty district gives the default (highest) charge.
  async function quote(district) {
    latest.current = district;
    setDelivery({ status: "loading", price: 0 });
    const result = await quoteDelivery({ lang, district });
    if (latest.current !== district) return; // the visitor already picked another district
    setDelivery(result.ok ? { status: "ready", price: result.price } : { status: "unknown", price: 0 });
  }

  useEffect(() => {
    quote("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onDistrict(event) {
    const district = event.target.value;
    setValues((v) => ({ ...v, district }));
    quote(district);
  }

  // Warns while typing about mistakes typing more cannot fix; reports an unfinished number once the field is left.
  const phoneIssue = phoneProblem(values.phone, phoneTouched);

  // Only the phone number can stop the order. Name, district and address are asked for but never block it.
  function onSubmit(event) {
    event.preventDefault();
    setPhoneTouched(true);
    setFailed(null);
    if (Object.keys(validateCheckout(values)).length) return;

    start(async () => {
      const result = await placeOrder({ lang, ...values });
      if (result.ok) {
        announceCart(0);
        const query = result.orderNo ? `?o=${encodeURIComponent(result.orderNo)}` : "";
        router.push(`/${lang}/order-success${query}`);
      } else {
        setFailed(result.reason === "empty" ? "emptyCart" : "failed");
      }
    });
  }

  const total = summary.subtotal - summary.discount + delivery.price;
  const row = "flex items-center justify-between";
  const label = "mb-1 block font-semibold text-heading";
  const star = (
    <span aria-hidden="true" className="text-red-600">
      {" "}
      *
    </span>
  );

  const submit = (
    <button type="submit" disabled={pending} className={buttonClass}>
      {pending ? labels.placing : labels.placeOrder}
    </button>
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="grid gap-8 pb-20 lg:grid-cols-[minmax(0,640px)_minmax(0,480px)] lg:justify-between lg:pb-0"
    >
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-heading">{labels.details}</h2>

        <div>
          <label htmlFor="co-name" className={label}>
            {labels.name}
          </label>
          <input
            id="co-name"
            value={values.name}
            onChange={set("name")}
            autoComplete="name"
            className={input}
          />
        </div>

        <div>
          <label htmlFor="co-phone" className={label}>
            {labels.phone}
            {star}
          </label>
          <input
            id="co-phone"
            type="tel"
            inputMode="tel"
            value={values.phone}
            onChange={set("phone")}
            onBlur={() => values.phone && setPhoneTouched(true)}
            autoComplete="tel"
            aria-invalid={Boolean(phoneIssue)}
            className={input}
          />
          {phoneIssue && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {labels.errors[phoneIssue]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="co-district" className={label}>
            {labels.district}
            {star}
          </label>
          <select id="co-district" value={values.district} onChange={onDistrict} className={input}>
            <option value="">{labels.chooseDistrict}</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="co-address" className={label}>
            {labels.address}
            {star}
          </label>
          <input
            id="co-address"
            type="text"
            value={values.address}
            onChange={set("address")}
            autoComplete="street-address"
            className={input}
          />
        </div>

        <div>
          <h2 className="mb-2 text-xl font-bold text-heading">{labels.payment}</h2>
          <div className="rounded-xl border border-brand-alt bg-secondary p-4">
            <p className="font-semibold text-heading">{labels.cod}</p>
            <p className="text-sm">{labels.codText}</p>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-subtle p-5">
        <h2 className="mb-4 text-xl font-bold text-heading">{labels.summary}</h2>

        <ul className="divide-y divide-subtle">
          {summary.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              {item.image && <img src={item.image} alt="" className="h-16 w-16 rounded-lg object-cover" />}
              <p className="line-clamp-2 min-w-0 flex-1 text-heading">{item.name}</p>
              <p className="whitespace-nowrap font-semibold text-heading">
                {item.totalText} <span className="font-normal">× {item.quantityText}</span>
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-2 border-t border-subtle pt-3">
          <div className={row}>
            <span>{labels.subtotal}</span>
            <span className="font-semibold text-heading">{formatPrice(summary.subtotal, lang)}</span>
          </div>
          {summary.discount > 0 && (
            <div className={row}>
              <span>{labels.discount}</span>
              <span className="font-semibold text-brand-alt">−{formatPrice(summary.discount, lang)}</span>
            </div>
          )}
          <div className={row}>
            <span>{labels.delivery}</span>
            <span className="font-semibold text-heading">
              {delivery.status === "ready"
                ? formatPrice(delivery.price, lang)
                : delivery.status === "loading"
                  ? labels.calculating
                  : "—"}
            </span>
          </div>
          {!values.district && delivery.status === "ready" && (
            <p className="text-sm">{labels.deliveryHint}</p>
          )}
          <div className={`${row} border-t border-subtle pt-3`}>
            <span className="text-lg font-semibold text-heading">{labels.total}</span>
            <span className="text-2xl font-bold text-brand">{formatPrice(total, lang)}</span>
          </div>
        </div>

        {failed && (
          <p role="alert" className="mt-4 text-sm font-semibold text-red-600">
            {failed === "emptyCart" ? labels.emptyCart : labels.failed}
          </p>
        )}

        {/* Desktop: the button sits under the summary. */}
        <div className="mt-5 hidden lg:block">{submit}</div>
      </aside>

      {/* Phone: the button floats at the bottom of the screen. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-subtle bg-white p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
        {submit}
      </div>
    </form>
  );
}
