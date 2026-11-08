import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { Notice } from "@/components/admin/ui";

async function Msg({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;
  return <div className="mx-auto max-w-md"><Notice msg={msg} /></div>;
}
export default function Page({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Connexion</h1>
      <Suspense fallback={null}><Msg searchParams={searchParams} /></Suspense>
      <LoginForm />
      <p className="mt-6 text-center text-sm"><Link className="underline" href="/admin/inscription">Créer un compte administrateur</Link></p>
    </section>
  );
}
