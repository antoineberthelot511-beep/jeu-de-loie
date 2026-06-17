"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

type Props = {
  onImageGenerated: (url: string) => void;
};

export default function PollinationsGenerator({ onImageGenerated }: Props) {
  const [prompt, setPrompt] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [genKey, setGenKey] = useState(0);

  const handleGenerate = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const encoded = encodeURIComponent(
      trimmed + ", cartoon sticker style, gros contour noir, fond simple"
    );
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true`;
    setPreviewUrl(url);
    setStatus("loading");
    setGenKey((k) => k + 1);
    // onImageGenerated n'est appelé qu'après le onLoad — pas avant
  };

  return (
    <div
      className="flex flex-col gap-2 mt-2 p-3 rounded-2xl"
      style={{
        border: "2.5px dashed var(--border)",
        background: "var(--bg-card-soft)",
      }}
    >
      <span
        className="field-label"
        style={{ fontSize: "0.8rem", letterSpacing: "0.03em" }}
      >
        🪄 Générer l&apos;image (IA)
      </span>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleGenerate();
          }
        }}
        placeholder="Décris l'objet…"
        className="input-field"
      />

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!prompt.trim()}
        className="btn-pill btn-pill-primary btn-pill-sm w-full"
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          letterSpacing: "0.04em",
          opacity: prompt.trim() ? 1 : 0.5,
        }}
      >
        ✨ Générer
      </button>

      {status === "loading" && (
        <span
          className="text-xs text-center animate-pulse"
          style={{ color: "var(--text-secondary)" }}
        >
          Génération en cours…
        </span>
      )}

      {status === "error" && (
        <span
          className="text-xs text-center"
          style={{ color: "var(--color-danger, #ef4444)" }}
        >
          Image non générée, essaie une autre description.
        </span>
      )}

      {/* L'img est montée en arrière-plan dès que previewUrl est défini.
          display:none pendant le chargement pour éviter l'icône cassée.
          genKey force un re-montage à chaque génération (même prompt). */}
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={genKey}
          src={previewUrl}
          alt="Aperçu IA"
          className="w-24 h-24 object-cover rounded-2xl self-center"
          style={{
            border: "2px solid var(--border)",
            display: status === "success" ? "block" : "none",
          }}
          onLoad={() => {
            setStatus("success");
            onImageGenerated(previewUrl);
          }}
          onError={() => {
            setStatus("error");
            setPreviewUrl(null);
          }}
        />
      )}
    </div>
  );
}
