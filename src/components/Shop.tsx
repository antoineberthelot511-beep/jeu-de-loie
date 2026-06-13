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
    setMessage(success ? null : "⚠ PAS ASSEZ DE ROUPIES ⚠");
  };

  return (
    <div className="y2k-window w-full">
      <div className="y2k-window-title">
        <span>◆ MARKET SHOP ◆</span>
        <span>★ CAPITALISTE LAND ★</span>
      </div>

      <div className="y2k-window-content space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="flex-1 min-w-[8rem]">
            <label className="y2k-label block mb-1">Nom du produit</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Chapeau"
              className="y2k-input w-full"
            />
          </div>

          <div className="w-24">
            <label className="y2k-label block mb-1">Prix</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="y2k-input w-full"
            />
          </div>

          <div>
            <label className="y2k-label block mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0])}
              className="text-xs"
              style={{ fontFamily: "var(--font-terminal), monospace", color: "var(--acid-green)" }}
            />
          </div>

          <button type="submit" className="y2k-btn y2k-btn-green">
            ＋ Ajouter
          </button>
        </form>

        <hr className="chrome-divider" />

        {message && (
          <p
            className="text-center text-sm"
            style={{
              fontFamily: "var(--font-display), sans-serif",
              color: "var(--magenta)",
              textShadow: "0 0 8px var(--magenta)",
            }}
          >
            {message}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 p-2 rounded-md"
              style={{
                background: "linear-gradient(135deg, #1a1a40, #06061a)",
                border: "2px solid var(--chrome-2)",
                boxShadow: "2px 2px 0 rgba(0,0,0,0.6), 0 0 8px var(--electric-blue)",
              }}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border-2"
                  style={{ borderColor: "var(--chrome-2)" }}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-md flex items-center justify-center text-2xl"
                  style={{ background: "#000", border: "2px solid var(--chrome-2)" }}
                >
                  ✧
                </div>
              )}
              <span
                className="text-sm font-medium text-center truncate w-full"
                style={{ fontFamily: "var(--font-terminal), monospace", color: "#fff" }}
              >
                {item.name}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--acid-green)", textShadow: "0 0 4px var(--acid-green)" }}
              >
                💰 {item.price} roupies
              </span>
              <button
                type="button"
                onClick={() => handleBuy(item)}
                className="y2k-btn y2k-btn-magenta w-full"
                style={{ fontSize: "0.7rem", padding: "0.4rem 0.6rem" }}
              >
                Acheter
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
