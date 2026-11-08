import { LoginForm } from "@/components/admin/LoginForm";
export default function Page() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="eyebrow text-center">Administration</p>
      <h1 className="mt-2 mb-8 text-center text-3xl font-semibold tracking-tight">Connexion</h1>
      <LoginForm />
    </section>
  );
}
