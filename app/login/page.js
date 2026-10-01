"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import { Loader2 } from "lucide-react";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = explicitCallbackUrl || "/tienda";
  const [mode, setMode] = useState("login"); // login | register
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getProviders().then((providers) => {
      setGoogleEnabled(Boolean(providers?.google));
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo crear la cuenta");
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Email o contraseña incorrectos");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StoreHeader />
      <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl font-bold">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {explicitCallbackUrl
            ? "Iniciá sesión o creá una cuenta para continuar con tu compra."
            : mode === "login"
              ? "Entrá para ver tu cuenta y tus pedidos."
              : "Creá tu cuenta para comprar más rápido la próxima vez."}
        </p>

        {googleEnabled && (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-line bg-panel py-2.5 text-sm font-semibold hover:border-steel"
            >
              <GoogleIcon /> Continuar con Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-steel">
              <span className="h-px flex-1 bg-line" />o con tu email
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className={`space-y-3 ${googleEnabled ? "" : "mt-6"}`}>
          {mode === "register" && (
            <Field label="Nombre (opcional)">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Tu nombre" />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="vos@email.com"
            />
          </Field>
          <Field label="Contraseña">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
          </Field>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-ink py-3 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-5 text-center text-sm text-ink-soft hover:underline"
        >
          {mode === "login" ? "¿No tenés cuenta? Creá una" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid var(--line);
            background: var(--panel);
            color: var(--ink);
            padding: 0.55rem 0.65rem;
            font-size: 0.9rem;
          }
        `}</style>
      </main>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">{label}</label>
      {children}
    </div>
  );
}
