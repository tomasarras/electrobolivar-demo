"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatThread from "@/components/ChatThread";

export default function VendedorConsultaBuyerPage() {
  const { buyerId } = useParams();
  const [data, setData] = useState(null);

  function load() {
    fetch(`/api/seller/chat/${buyerId}`)
      .then((res) => res.json())
      .then(setData);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId]);

  async function handleSend(text) {
    await fetch(`/api/seller/chat/${buyerId}`, {
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
      title={data.buyer.name || data.buyer.email}
      backHref="/vendedor/consultas"
      messages={data.messages}
      mySender="seller"
      onSend={handleSend}
    />
  );
}
