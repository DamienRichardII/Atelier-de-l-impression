"use client";
import { useActionState } from "react";
import { forgotPassword } from "@/app/admin/actions";

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPassword, undefined);
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4 p-6">
      <p className="text-sm text-muted">Saisissez l'adresse de votre compte administrateur : nous vous envoyons un lien pour choisir un nouveau mot de passe.</p>
      <label className="block text-sm">E-mail
        <input name="email" type="email" required autoComplete="username" className="mt-1 w-full min-h-12 rounded-xl border border-line px-3 py-3 text-base outline-none focus:border-black" />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Envoi…" : "Envoyer le lien"}</button>
    </form>
  );
}
