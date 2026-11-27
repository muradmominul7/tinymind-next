"use client";

import { forgotPasswordAction } from "@/actions/auth";
import { useActionState } from "react";

const field = "mt-1 block w-full rounded-lg border border-subtle bg-white px-3 py-2.5 text-body outline-none focus:border-brand";

export default function ForgotPasswordForm({ lang, labels }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, { error: null, email: "", sent: false });

  if (state.sent) {
    return (
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
        {labels.sent}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />

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
