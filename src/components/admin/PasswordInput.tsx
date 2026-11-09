"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/** Champ mot de passe avec bouton « œil » pour afficher / masquer la saisie. */
export function PasswordInput({ name, autoComplete, minLength, label }: { name: string; autoComplete: string; minLength?: number; label: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm">{label}
      <span className="relative mt-1 block">
        <input name={name} type={show ? "text" : "password"} required minLength={minLength} autoComplete={autoComplete} autoCapitalize="none" spellCheck={false}
          className="w-full min-h-12 rounded-xl border border-line px-3 py-3 pr-12 text-base outline-none focus:border-black" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-black">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
