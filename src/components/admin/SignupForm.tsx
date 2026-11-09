"use client";
import { useActionState } from "react";
import { signup } from "@/app/admin/actions";
import { PasswordInput } from "./PasswordInput";

const input = "mt-1 w-full rounded-xl border border-line px-3 py-3 outline-none focus:border-black";
export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4 p-6">
      <label className="block text-sm">E-mail
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <PasswordInput name="password" label="Mot de passe (10 caractères minimum)" autoComplete="new-password" minLength={10} />
      <PasswordInput name="again" label="Confirmer le mot de passe" autoComplete="new-password" minLength={10} />
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Envoi…" : "Créer mon compte"}</button>
      <p className="text-xs text-muted">Réservé aux adresses autorisées par l'atelier. Un e-mail de confirmation vous sera envoyé.</p>
    </form>
  );
}
