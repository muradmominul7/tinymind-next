"use client";

import { resetPasswordAction } from "@/actions/auth";
import { useActionState } from "react";
import PasswordField from "./PasswordField";

const BTN = "w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white disabled:opacity-60";

export default function ResetPasswordForm({ lang, token, email, labels, common }) {
  const [state, action, pending] = useActionState(resetPasswordAction, { error: null });

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />

      <PasswordField label={labels.password} name="password" autoComplete="new-password" minLength={6} labels={common} />
      <PasswordField label={labels.confirm} name="confirm" autoComplete="new-password" minLength={6} labels={common} />

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={BTN}>
        {pending ? labels.wait : labels.submit}
      </button>
    </form>
  );
}
