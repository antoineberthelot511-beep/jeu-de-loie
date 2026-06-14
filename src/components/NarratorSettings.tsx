"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { WorldImages } from "@/hooks/useGameStatus";
import { worlds } from "@/data/worlds";
import Reveal from "@/components/Reveal";

type NarratorSettingsProps = {
  gameId: string | null;
  worldImages: WorldImages;
};

export default function NarratorSettings({ gameId, worldImages }: NarratorSettingsProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const handleUpload = async (worldId: string, file: File | undefined) => {
    if (!file || !gameId) return;

    setUploadingId(worldId);
    setMessages((prev) => ({ ...prev, [worldId]: "" }));

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${worldId}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("maps")
      .upload(path, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      setMessages((prev) => ({ ...prev, [worldId]: "error:Erreur lors de l'envoi de l'image." }));
      setUploadingId(null);
      return;
    }

    const { data } = supabase.storage.from("maps").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("games")
      .update({ world_images: { ...worldImages, [worldId]: data.publicUrl } })
      .eq("id", gameId);

    setMessages((prev) => ({
      ...prev,
      [worldId]: updateError ? "error:Erreur lors de l'enregistrement." : "ok:Image mise à jour.",
    }));
    setUploadingId(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">
      {worlds.map((world, index) => {
        const currentImage = worldImages[world.id] ?? world.sceneImage;
        const message = messages[world.id];

        return (
          <Reveal key={world.id} delay={index * 60}>
            <div className="bento-card w-full flex flex-col gap-3 sm:flex-row sm:items-center">
              <div
                className="relative w-full sm:w-32 aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden flex-shrink-0"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {currentImage ? (
                  <Image src={currentImage} alt={world.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: world.color }} />
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <span className="section-title">{world.name}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingId === world.id}
                  onChange={(e) => handleUpload(world.id, e.target.files?.[0])}
                  className="file-field"
                />
                {uploadingId === world.id && <p className="body-text">Envoi…</p>}
                {message && (
                  <p className={message.startsWith("error:") ? "danger-text" : "success-text"}>
                    {message.replace(/^(error|ok):/, "")}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
