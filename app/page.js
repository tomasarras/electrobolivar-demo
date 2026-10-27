"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RotateCcw, Loader2 } from "lucide-react";
import { useAdmin } from "@/components/AdminProvider";
import StoreHeader from "@/components/StoreHeader";

const ADMIN_EMAIL = "bolivarmarket08@gmail.com";

export default function RoleSelectorPage() {
  const router = useRouter();
  const { enterAdmin } = useAdmin();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const showAdminButton = adminEmail.trim().toLowerCase() === ADMIN_EMAIL;

  function handleAdmin() {
    enterAdmin();
    router.push("/admin");
  }

  async function handleReset() {
    setResetting(true);
    setResetMessage("");
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo restablecer la demo");
      setResetMessage("Demo restablecida — todo volvió al estado inicial.");
    } catch (err) {
      setResetMessage(err.message);
    } finally {
      setResetting(false);
      setConfirmingReset(false);
    }
  }

  return (
    <>
      <StoreHeader />
      <div className="flex flex-col items-center justify-center gap-4 bg-paper px-4 py-16 text-center text-ink">
      <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent">
        <span className="flex items-center font-display text-3xl font-extrabold leading-none tracking-tight text-accent-ink">
          <span>B</span>
          <span className="-mx-0.5 inline-block h-8 w-[3px] -skew-x-[25deg] bg-accent-ink" />
          <span>M</span>
        </span>
      </span>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        BOLIVAR<span className="text-accent">MARKET</span>
      </h1>
      <p className="max-w-sm text-sm text-ink-soft">Demo de portfolio.</p>

      <div className="mt-6 w-full max-w-xs">
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="Acceso administrador"
          className="w-full rounded-md border border-line bg-panel px-3 py-2 text-center text-xs text-ink-soft placeholder:text-steel focus:outline-none"
        />
        {showAdminButton && (
          <button
            type="button"
            onClick={handleAdmin}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-panel p-3 text-left transition hover:-translate-y-0.5 hover:border-steel"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-paper">
              <ShieldCheck size={18} />
            </span>
            <span className="block text-sm font-semibold">Entrar como administrador</span>
          </button>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {!confirmingReset ? (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink-soft hover:border-steel"
          >
            <RotateCcw size={16} />
            Restablecer demo
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-danger/40 bg-panel px-4 py-2 text-sm text-danger">
            <span>¿Borrar todo y volver al estado inicial?</span>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1 text-xs font-semibold text-accent-ink hover:brightness-95 disabled:opacity-60"
            >
              {resetting && <Loader2 size={12} className="animate-spin" />}
              Sí, restablecer
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              disabled={resetting}
              className="text-xs font-semibold hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {resetMessage && <p className="mt-3 text-sm text-ink-soft">{resetMessage}</p>}

      <p className="mt-8 max-w-md text-center text-xs text-steel">
        Es un proyecto de portfolio: no hay contraseñas reales, elegís cómo entrar y listo. Los datos son ficticios.
      </p>
      </div>
    </>
  );
}
