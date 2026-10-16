"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";

export default function ChatThread({ title, backHref, messages, mySender, onSend }) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await onSend(text);
      setBody("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Link href={backHref} className="flex items-center gap-1 text-xs text-steel hover:text-ink">
        <ArrowLeft size={13} />
        Volver
      </Link>
      <h1 className="mt-2 font-display text-xl font-bold">{title}</h1>

      <div className="mt-4 flex max-h-[60vh] min-h-[200px] flex-col gap-2 overflow-y-auto rounded-md border border-line bg-panel p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-steel">Todavía no hay mensajes. Escribí el primero.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender === mySender ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-md px-3 py-2 text-sm ${
                  m.sender === mySender ? "bg-ink text-paper" : "bg-panel-2 text-ink"
                }`}
              >
                <p>{m.body}</p>
                <p className={`mt-1 font-mono text-[10px] ${m.sender === mySender ? "text-paper/60" : "text-steel"}`}>
                  {new Date(m.createdAt).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribí un mensaje"
          className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-50"
        >
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar
        </button>
      </form>
    </div>
  );
}
