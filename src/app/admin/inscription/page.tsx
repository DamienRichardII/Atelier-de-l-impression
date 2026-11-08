import Link from "next/link";
import { SignupForm } from "@/components/admin/SignupForm";
export const metadata = { title: "Créer un compte administrateur" };
export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Créer un compte administrateur</h1>
      <SignupForm />
      <p className="mt-6 text-center text-sm"><Link className="underline" href="/admin/connexion">Déjà un compte ? Se connecter</Link></p>
    </section>
  );
}
