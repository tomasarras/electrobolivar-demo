"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShieldCheck, Store, RotateCcw, Loader2, ShoppingCart } from "lucide-react";
import { useAdmin } from "@/components/AdminProvider";

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center text-ink">
      <span className="flex h-14 w-14 items-center justify-center rounded-md bg-accent text-accent-ink">
        <Zap size={26} />
      </span>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        BOLIVAR<span className="text-accent">MARKET</span>
      </h1>
      <p className="max-w-sm text-sm text-ink-soft">Demo de portfolio · elegí cómo querés entrar.</p>

      <div className="mt-4 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push("/tienda")}
          className="flex flex-col items-start gap-3 rounded-md border border-line bg-panel p-5 text-left transition hover:-translate-y-0.5 hover:border-steel"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-ink">
            <ShoppingCart size={20} />
          </span>
          <span className="block text-base font-semibold">Cliente</span>
          <span className="block text-sm text-ink-soft">Comprar electrodomésticos</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/login?callbackUrl=%2Fvendedor")}
          className="flex flex-col items-start gap-3 rounded-md border border-line bg-panel p-5 text-left transition hover:-translate-y-0.5 hover:border-steel"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-accent text-accent-ink">
            <Store size={20} />
          </span>
          <span className="block text-base font-semibold">Vendedor</span>
          <span className="block text-sm text-ink-soft">Publicar y vender tus productos</span>
        </button>
      </div>

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
  );
}
