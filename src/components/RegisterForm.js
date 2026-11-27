"use client";

import { registerAction } from "@/actions/auth";
import { useActionState } from "react";
import PasswordField from "./PasswordField";

const field = "mt-1 block w-full rounded-lg border border-subtle bg-white px-3 py-2.5 text-body outline-none focus:border-brand";

export default function RegisterForm({ lang, labels, common }) {
  const [state, action, pending] = useActionState(registerAction, { error: null, name: "", phone: "", email: "" });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

      <label className="block text-sm font-medium text-heading">
        {labels.name}
        <input name="name" defaultValue={state.name} autoComplete="name" required className={field} />
      </label>

      <label className="block text-sm font-medium text-heading">
        {labels.phone}
        <input
          name="phone"
          type="tel"
          inputMode="numeric"
          defaultValue={state.phone}
          autoComplete="tel"
          required
          className={field}
        />
      </label>

      <label className="block text-sm font-medium text-heading">
        {labels.email}
        <input
          name="email"
          type="email"
          defaultValue={state.email}
          autoComplete="email"
          autoCapitalize="none"
          required
          className={field}
        />
      </label>

      <PasswordField label={labels.password} name="password" autoComplete="new-password" minLength={6} labels={common} />
      <PasswordField label={labels.confirm} name="confirm" autoComplete="new-password" minLength={6} labels={common} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60">
        {pending ? labels.wait : labels.submit}
      </button>
    </form>
  );
}
