"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RotateCcw, Loader2 } from "lucide-react";
import { useAdmin } from "@/components/AdminProvider";

const ADMIN_EMAIL = "bolivarmarket08@gmail.com";

// Tucked at the bottom of the catalog — same hidden admin-access + demo-reset
// controls that used to live on the old role-selector homepage.
export default function AdminAccessFooter() {
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
    <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center gap-4 border-t border-line px-4 py-10 text-center sm:px-6">
      <div className="w-full max-w-xs">
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

      <div className="flex flex-wrap items-center justify-center gap-3">
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

      {resetMessage && <p className="text-sm text-ink-soft">{resetMessage}</p>}

      <p className="max-w-md text-center text-xs text-steel">
        Es un proyecto de portfolio: no hay contraseñas reales. Los datos son ficticios.
      </p>
    </div>
  );
}
