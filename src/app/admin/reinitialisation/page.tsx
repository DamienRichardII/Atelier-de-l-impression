import { Suspense } from "react";
import Link from "next/link";
import { readResetToken } from "@/lib/admin/reset";
import { ResetForm } from "@/components/admin/ResetForm";
export const metadata = { title: "Nouveau mot de passe" };

async function Body({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;
  const tok = readResetToken(t);
  if (!tok) return <div className="card mx-auto max-w-md p-6 text-center"><p className="text-sm text-red-700">Ce lien est invalide ou expiré.</p><Link className="mt-4 inline-block text-sm underline" href="/admin/mot-de-passe-oublie">Refaire une demande</Link></div>;
  return <ResetForm token={t} email={tok.email} />;
}
export default function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Nouveau mot de passe</h1>
      <Suspense fallback={null}><Body searchParams={searchParams} /></Suspense>
    </section>
  );
}
