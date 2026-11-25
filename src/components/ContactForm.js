"use client";

import { useState } from "react";
import { sendContact } from "@/actions/contact";

const EMPTY = { name: "", email: "", phone: "", message: "", website: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Name, email, phone (optional) and message. The texts come from the dictionary (labels).
export default function ContactForm({ lang, labels }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed

  const input =
    "w-full rounded-xl border border-subtle bg-page px-5 py-3.5 text-base text-heading outline-none transition-colors placeholder:text-body/60 focus:border-brand-alt";
  const label = "mb-1.5 block text-base text-heading";
  const problem = "mt-1 text-sm text-red-600";

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event) {
    event.preventDefault();
    if (status === "sending") return;

    const found = {};
    if (!values.name.trim()) found.name = labels.errorName;
    if (!EMAIL.test(values.email.trim())) found.email = labels.errorEmail;
    if (values.message.trim().length < 2) found.message = labels.errorMessage;
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    const result = await sendContact({ lang, ...values });

    if (result.ok) {
      setValues(EMPTY);
      setStatus("sent");
    } else if (result.errors) {
      setErrors({
        name: result.errors.name ? labels.errorName : undefined,
        email: result.errors.email ? labels.errorEmail : undefined,
        message: result.errors.message ? labels.errorMessage : undefined,
      });
      setStatus("idle");
    } else {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-subtle bg-secondary p-8 text-center">
        <p className="text-lg font-semibold text-heading">{labels.success}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 rounded-xl border-2 border-brand px-6 py-2.5 font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          {labels.another}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className={label}>
          {labels.name} <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          value={values.name}
          onChange={set("name")}
          placeholder={labels.namePlaceholder}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          className={input}
        />
        {errors.name && <p className={problem}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="contact-email" className={label}>
          {labels.email} <span aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={values.email}
          onChange={set("email")}
          placeholder={labels.emailPlaceholder}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          className={input}
        />
        {errors.email && <p className={problem}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="contact-phone" className={label}>
          {labels.phone}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={set("phone")}
          placeholder={labels.phonePlaceholder}
          autoComplete="tel"
          className={input}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={label}>
          {labels.message} <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={8}
          value={values.message}
          onChange={set("message")}
          placeholder={labels.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          className={`${input} resize-y`}
        />
        {errors.message && <p className={problem}>{errors.message}</p>}
      </div>

      {/* Hidden from people; only bots fill it in. */}
      <input
        name="website"
        type="text"
        value={values.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {status === "failed" && (
        <p role="alert" className={problem}>
          {labels.failed}
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
