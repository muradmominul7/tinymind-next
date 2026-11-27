"use client";

import { changeEmailAction } from "@/actions/auth";
import { useActionState } from "react";
import PasswordField from "./PasswordField";

const field = "mt-1 block w-full rounded-lg border border-subtle bg-white px-3 py-2.5 text-body outline-none focus:border-brand";

export default function ChangeEmailForm({ lang, labels, common, hasEmail }) {
  const [state, action, pending] = useActionState(changeEmailAction, { error: null, email: "" });

  return (
    <details className="group" open={!hasEmail || undefined}>
      <summary className="cursor-pointer text-sm font-semibold text-brand underline">
        {hasEmail ? labels.changeEmail : labels.addEmail}
      </summary>

      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="lang" value={lang} />

        <label className="block text-sm font-medium text-heading">
          {labels.newEmail}
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

        <PasswordField label={labels.currentPassword} name="password" autoComplete="current-password" labels={common} />

        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {pending ? labels.wait : labels.save}
        </button>
      </form>
    </details>
  );
}
