"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatThread from "@/components/ChatThread";

export default function PerfilMensajeSellerPage() {
  const { sellerId } = useParams();
  const [data, setData] = useState(null);

  function load() {
    fetch(`/api/chat/${sellerId}`)
      .then((res) => res.json())
      .then(setData);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  async function handleSend(text) {
    await fetch(`/api/chat/${sellerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    load();
  }

  if (!data) return <p className="text-sm text-steel">Cargando…</p>;
  if (data.error) return <p className="text-sm text-danger">{data.error}</p>;

  return (
    <ChatThread
      title={data.seller.storeName}
      backHref="/perfil/mensajes"
      messages={data.messages}
      mySender="buyer"
      onSend={handleSend}
    />
  );
}
