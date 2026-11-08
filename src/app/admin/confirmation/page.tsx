import { Suspense } from "react";
import Link from "next/link";
import { readConfirmToken } from "@/lib/admin/confirm";
import { confirmAccount } from "@/app/admin/actions";
export const metadata = { title: "Confirmation du compte" };

async function Body({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;
  const email = readConfirmToken(t);
  if (!email) return <div className="card mx-auto max-w-md p-6 text-center"><p className="text-sm text-red-700">Ce lien est invalide ou expiré.</p><Link className="mt-4 inline-block text-sm underline" href="/admin/inscription">Refaire une demande</Link></div>;
  return (
    <form action={confirmAccount} className="card mx-auto max-w-md space-y-4 p-6 text-center">
      <p className="text-sm">Confirmer le compte administrateur de <strong>{email}</strong> ?</p>
      <input type="hidden" name="t" value={t} />
      <button className="btn btn-dark w-full">Confirmer mon compte</button>
    </form>
  );
}
export default function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Confirmation du compte</h1>
      <Suspense fallback={null}><Body searchParams={searchParams} /></Suspense>
    </section>
  );
}
