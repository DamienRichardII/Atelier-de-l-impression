"use client";
import { useActionState } from "react";
import { resetPassword } from "@/app/admin/actions";
import { PasswordInput } from "./PasswordInput";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4 p-6">
      <p className="text-sm">Nouveau mot de passe pour <strong>{email}</strong></p>
      <input type="hidden" name="t" value={token} />
      <PasswordInput name="password" label="Nouveau mot de passe (10 caractères minimum)" autoComplete="new-password" minLength={10} />
      <PasswordInput name="again" label="Confirmer le mot de passe" autoComplete="new-password" minLength={10} />
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
    </form>
  );
}
