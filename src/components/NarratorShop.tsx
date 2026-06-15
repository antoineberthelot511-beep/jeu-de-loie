"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/types/game";
import Reveal from "@/components/Reveal";

type NarratorShopProps = {
  gameId: string | null;
  shopItems: Item[];
};

export default function NarratorShop({ gameId, shopItems }: NarratorShopProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;

    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;

    const newItem: Item = {
      id: crypto.randomUUID(),
      name: trimmedName,
      price: parsedPrice,
      image,
      description: description.trim() || undefined,
    };

    void supabase
      .from("games")
      .update({ shop_items: [...shopItems, newItem] })
      .eq("id", gameId)
      .then(({ error }) => {
        setMessage(error ? "Erreur lors de l'ajout." : `${trimmedName} ajouté à l'épicerie.`);
      });

    setName("");
    setPrice("");
    setImage(undefined);
    setDescription("");
  };

  const handleRemove = (itemId: string) => {
    if (!gameId) return;

    void supabase
      .from("games")
      .update({ shop_items: shopItems.filter((item) => item.id !== itemId) })
      .eq("id", gameId)
      .then();
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
      <Reveal>
        <div className="bento-card w-full flex flex-col gap-4">
          <h3 className="section-title">Ajouter un produit</h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="field-label">Nom du produit</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Chapeau"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Prix (roupies)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 10"
                className="input-field"
              />
            </div>

            <div>
              <label className="field-label">Image (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0])}
                className="file-field"
              />
            </div>

            <div>
              <label className="field-label">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Protège du soleil et de la pluie..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <button type="submit" disabled={!gameId} className="btn-pill btn-pill-primary w-full">
              Ajouter à l&apos;épicerie
            </button>
          </form>

          {message && <p className="success-text">{message}</p>}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="bento-card w-full flex flex-col gap-3">
          <h3 className="section-title">Produits de l&apos;épicerie</h3>

          {shopItems.length > 0 ? (
            <div className="flex flex-col gap-2">
              {shopItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2"
                  style={{ background: "var(--bg-card-soft)" }}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-2xl flex-shrink-0"
                    />
                  ) : (
                    <span className="avatar-placeholder w-12 h-12 rounded-2xl flex-shrink-0">—</span>
                  )}

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.description}
                      </span>
                    )}
                    <span className="badge badge-neutral w-fit">{item.price} roupies</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="btn-pill btn-pill-danger btn-pill-sm flex-shrink-0"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="body-text">Aucun produit dans l&apos;épicerie.</p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
