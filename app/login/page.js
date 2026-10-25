"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import StoreHeader from "@/components/StoreHeader";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

// Google es la única forma de iniciar sesión en todo el sitio (comprador y
// vendedor), por mayor seguridad — no hay alternativa de email/contraseña.
function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/tienda";
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google));
    });
  }, []);

  return (
    <>
      <StoreHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-ink-soft">Iniciá sesión con tu cuenta de Google.</p>

        {googleEnabled ? (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-panel py-2.5 text-sm font-semibold hover:border-steel"
          >
            <GoogleIcon /> Continuar con Google
          </button>
        ) : (
          <p className="mt-6 text-sm text-ink-soft">
            El inicio de sesión con Google todavía no está disponible. Probá de nuevo más tarde.
          </p>
        )}
      </main>
    </>
  );
}
