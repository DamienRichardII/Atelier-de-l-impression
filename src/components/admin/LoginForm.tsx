"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/admin/actions";
import { PasswordInput } from "./PasswordInput";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4 p-6">
      <label className="block text-sm">E-mail
        <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-xl border border-line px-3 py-3 outline-none focus:border-black" />
      </label>
      <PasswordInput name="password" label="Mot de passe" autoComplete="current-password" />
      <p className="text-right text-sm"><Link href="/admin/mot-de-passe-oublie" className="underline">Mot de passe oublié ?</Link></p>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
