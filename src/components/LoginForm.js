"use client";

import { loginAction } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";
import PasswordField from "./PasswordField";

const field = "mt-1 block w-full rounded-lg border border-subtle bg-white px-3 py-2.5 text-body outline-none focus:border-brand";

export default function LoginForm({ lang, labels, common }) {
  const [state, action, pending] = useActionState(loginAction, { error: null, email: "" });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

      <label className="block text-sm font-medium text-heading">
        {labels.identifier}
        <input
          name="email"
          type="email"
          defaultValue={state.email}
          autoComplete="username"
          autoCapitalize="none"
          required
          className={field}
        />
      </label>

      <PasswordField label={labels.password} name="password" autoComplete="current-password" labels={common} />

      <p className="text-right text-sm">
        <Link href={`/${lang}/forgot-password`} className="text-heading hover:underline">
          {labels.forgot}
        </Link>
      </p>

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
