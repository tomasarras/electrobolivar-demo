import { NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { CATEGORIES } from "@/lib/categories";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "La búsqueda por foto no está configurada (falta ANTHROPIC_API_KEY)." },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }
  if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen no puede pesar más de 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const categoryLabels = CATEGORIES.map((c) => c.label).join(", ");

  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 50,
      system:
        "Sos el buscador por foto de MercadoBolívar, una tienda online argentina. " +
        `Las categorías del catálogo son: ${categoryLabels}. ` +
        "Te mandan una foto de un producto. Respondé ÚNICAMENTE con 2 a 5 palabras clave en español " +
        "(sin puntuación, sin explicación) que describan qué es el producto, para buscarlo en el catálogo.",
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: file.type, data: buffer.toString("base64") } },
            { type: "text", text: "¿Qué producto es? Dame las palabras clave para buscarlo." },
          ],
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text?.trim();
    if (!text) throw new Error("Respuesta vacía");

    return NextResponse.json({ query: text });
  } catch (err) {
    return NextResponse.json({ error: err.message || "No se pudo analizar la imagen" }, { status: 500 });
  }
}
