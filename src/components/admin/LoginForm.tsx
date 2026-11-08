"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="card mx-auto max-w-md space-y-4 p-6">
      <label className="block text-sm">E-mail
        <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-xl border border-line px-3 py-3 outline-none focus:border-black" />
      </label>
      <label className="block text-sm">Mot de passe
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-xl border border-line px-3 py-3 outline-none focus:border-black" />
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button className="btn btn-dark w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
