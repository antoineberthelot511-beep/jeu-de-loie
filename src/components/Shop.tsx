"use client";

import { useState } from "react";
import type { Item } from "@/types/game";

type ShopProps = {
  shopItems: Item[];
  onAddItem: (item: Item) => void;
  onBuy: (item: Item) => boolean;
};

export default function Shop({ shopItems, onAddItem, onBuy }: ShopProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
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

    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;

    onAddItem({
      id: crypto.randomUUID(),
      name: trimmedName,
      price: parsedPrice,
      image,
    });

    setName("");
    setPrice("");
    setImage(undefined);
  };

  const handleBuy = (item: Item) => {
    const success = onBuy(item);
    setMessage(success ? null : "Pas assez de roupies.");
  };

  return (
    <div className="bento-card w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="eyebrow">Capitaliste Land</span>
        <h2 className="section-title">Market Shop</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[8rem]">
          <label className="field-label">Nom du produit</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Chapeau"
            className="input-field"
          />
        </div>

        <div className="w-24">
          <label className="field-label">Prix</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0])}
            className="file-field"
          />
        </div>

        <button type="submit" className="btn-pill btn-pill-soft">
          Ajouter
        </button>
      </form>

      <hr className="divider" />

      {message && <p className="danger-text">{message}</p>}

      <div className="bento-grid">
        {shopItems.map((item) => (
          <div key={item.id} className="bento-card-soft flex flex-col items-center gap-2">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-2xl"
              />
            ) : (
              <div className="avatar-placeholder w-16 h-16 rounded-2xl">—</div>
            )}
            <span className="text-sm font-medium text-center truncate w-full" style={{ color: "var(--text-primary)" }}>
              {item.name}
            </span>
            <span className="badge badge-neutral">{item.price} roupies</span>
            <button
              type="button"
              onClick={() => handleBuy(item)}
              className="btn-pill btn-pill-primary btn-pill-sm w-full"
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
