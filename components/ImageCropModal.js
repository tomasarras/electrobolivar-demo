"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";

const DISPLAY_MAX = 420;
const MIN_SIZE = 40;

export default function ImageCropModal({ file, onCancel, onConfirm }) {
  const imgRef = useRef(null);
  const [imageUrl] = useState(() => URL.createObjectURL(file));
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [crop, setCrop] = useState(null); // { x, y, w, h } in displayed pixels
  const [drag, setDrag] = useState(null); // { mode: "move"|"resize", startX, startY, start: {...crop} }
  const [working, setWorking] = useState(false);

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    const width = ratio >= 1 ? DISPLAY_MAX : DISPLAY_MAX * ratio;
    const height = ratio >= 1 ? DISPLAY_MAX / ratio : DISPLAY_MAX;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setDisplaySize({ width, height });
    const size = Math.min(width, height) * 0.8;
    setCrop({ x: (width - size) / 2, y: (height - size) / 2, w: size, h: size });
  }

  useEffect(() => {
    if (!drag) return;
    function handleMove(e) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      setCrop((prev) => {
        if (!prev) return prev;
        if (drag.mode === "move") {
          const x = clamp(drag.start.x + dx, 0, displaySize.width - drag.start.w);
          const y = clamp(drag.start.y + dy, 0, displaySize.height - drag.start.h);
          return { ...prev, x, y };
        }
        const w = clamp(drag.start.w + dx, MIN_SIZE, displaySize.width - drag.start.x);
        const h = clamp(drag.start.h + dy, MIN_SIZE, displaySize.height - drag.start.y);
        return { ...prev, w, h };
      });
    }
    function handleUp() {
      setDrag(null);
    }
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [drag, displaySize]);

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), Math.max(min, max));
  }

  async function handleConfirm() {
    if (!crop || !naturalSize.width) return;
    setWorking(true);
    try {
      const scaleX = naturalSize.width / displaySize.width;
      const scaleY = naturalSize.height / displaySize.height;
      const sx = crop.x * scaleX;
      const sy = crop.y * scaleY;
      const sw = crop.w * scaleX;
      const sh = crop.h * scaleY;

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type || "image/jpeg", 0.92));
      const cropped = new File([blob], file.name, { type: blob.type });
      onConfirm(cropped);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
      <div className="w-full max-w-md rounded-md border border-line bg-panel p-4">
        <p className="text-sm font-semibold">Recortá la imagen</p>
        <p className="mt-0.5 text-xs text-ink-soft">Arrastrá para mover y la esquina para cambiar el tamaño.</p>

        <div
          className="relative mt-3 select-none overflow-hidden rounded-md bg-panel-2"
          style={{ width: displaySize.width || DISPLAY_MAX, height: displaySize.height || DISPLAY_MAX, margin: "0 auto" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            className="absolute left-0 top-0 h-full w-full object-contain"
          />
          {crop && (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(0deg, rgba(0,0,0,0.45), rgba(0,0,0,0.45))",
                  clipPath: `polygon(0 0, 0 100%, ${crop.x}px 100%, ${crop.x}px ${crop.y}px, ${crop.x + crop.w}px ${crop.y}px, ${crop.x + crop.w}px ${crop.y + crop.h}px, ${crop.x}px ${crop.y + crop.h}px, ${crop.x}px 100%, 100% 100%, 100% 0)`,
                }}
              />
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDrag({ mode: "move", startX: e.clientX, startY: e.clientY, start: { ...crop } });
                }}
                className="absolute cursor-move border-2 border-accent"
                style={{ left: crop.x, top: crop.y, width: crop.w, height: crop.h }}
              >
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDrag({ mode: "resize", startX: e.clientX, startY: e.clientY, start: { ...crop } });
                  }}
                  className="absolute -bottom-1.5 -right-1.5 h-4 w-4 cursor-se-resize rounded-full border-2 border-paper bg-accent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-steel"
          >
            <X size={14} />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={working || !crop}
            className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
          >
            <Check size={14} />
            Usar recorte
          </button>
        </div>
      </div>
    </div>
  );
}
