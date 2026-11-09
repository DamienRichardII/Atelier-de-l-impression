import Link from "next/link";
import { ForgotForm } from "@/components/admin/ForgotForm";
export const metadata = { title: "Mot de passe oublié" };
export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Mot de passe oublié</h1>
      <ForgotForm />
      <p className="mt-6 text-center text-sm"><Link className="underline" href="/admin/connexion">Retour à la connexion</Link></p>
    </section>
  );
}
