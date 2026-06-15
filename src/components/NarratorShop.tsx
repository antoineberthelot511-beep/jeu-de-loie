"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Item } from "@/types/game";
import Reveal from "@/components/Reveal";

type NarratorShopProps = {
  gameId: string | null;
  shopItems: Item[];
};

function readFileAsDataUrl(file: File, onLoad: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const result = event.target?.result;
    if (typeof result === "string") onLoad(result);
  };
  reader.readAsDataURL(file);
}

export default function NarratorShop({ gameId, shopItems }: NarratorShopProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [editDescription, setEditDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId) return;

    const trimmedName = name.trim();
    const parsedPrice = Number(price);
    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;

    const trimmedQuantity = quantity.trim();
    const parsedQuantity = trimmedQuantity === "" ? undefined : Number(trimmedQuantity);
    if (parsedQuantity !== undefined && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0)) return;

    const newItem: Item = {
      id: crypto.randomUUID(),
      name: trimmedName,
      price: parsedPrice,
      quantity: parsedQuantity,
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
    setQuantity("");
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

    if (editingId === itemId) setEditingId(null);
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
    setEditQuantity(item.quantity === undefined ? "" : String(item.quantity));
    setEditImage(item.image);
    setEditDescription(item.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    if (!gameId) return;

    const trimmedName = editName.trim();
    const parsedPrice = Number(editPrice);
    if (!trimmedName || !Number.isFinite(parsedPrice) || parsedPrice < 0) return;

    const trimmedQuantity = editQuantity.trim();
    const parsedQuantity = trimmedQuantity === "" ? undefined : Number(trimmedQuantity);
    if (parsedQuantity !== undefined && (!Number.isFinite(parsedQuantity) || parsedQuantity < 0)) return;

    const updatedItems = shopItems.map((item) =>
      item.id === itemId
        ? {
            ...item,
            name: trimmedName,
            price: parsedPrice,
            quantity: parsedQuantity,
            image: editImage,
            description: editDescription.trim() || undefined,
          }
        : item
    );

    void supabase
      .from("games")
      .update({ shop_items: updatedItems })
      .eq("id", gameId)
      .then();

    setEditingId(null);
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

            <div className="flex gap-2">
              <div className="flex-1">
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

              <div className="flex-1">
                <label className="field-label">Quantité</label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Illimité"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="field-label">Image (optionnel)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFileAsDataUrl(file, setImage);
                }}
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
              {shopItems.map((item) =>
                editingId === item.id ? (
                  <form
                    key={item.id}
                    onSubmit={(e) => handleSaveEdit(e, item.id)}
                    className="flex flex-col gap-3 rounded-xl px-3 py-3"
                    style={{ background: "var(--bg-card-soft)" }}
                  >
                    <div>
                      <label className="field-label">Nom du produit</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input-field"
                      />
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="field-label">Prix (roupies)</label>
                        <input
                          type="number"
                          min="0"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="input-field"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="field-label">Quantité</label>
                        <input
                          type="number"
                          min="0"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          placeholder="Illimité"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="field-label">Image (optionnel)</label>
                      {editImage && (
                        // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
                        <img
                          src={editImage}
                          alt={editName}
                          className="w-12 h-12 object-cover rounded-2xl mb-2"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) readFileAsDataUrl(file, setEditImage);
                        }}
                        className="file-field"
                      />
                    </div>

                    <div>
                      <label className="field-label">Description (optionnel)</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        className="input-field resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="btn-pill btn-pill-primary btn-pill-sm flex-1">
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn-pill btn-pill-secondary btn-pill-sm flex-1"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
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
                      <div className="flex gap-1.5">
                        <span className="badge badge-neutral w-fit">{item.price} roupies</span>
                        <span className="badge badge-neutral w-fit">
                          {item.quantity === undefined ? "Stock illimité" : `Stock : ${item.quantity}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="btn-pill btn-pill-soft btn-pill-sm"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="btn-pill btn-pill-danger btn-pill-sm"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="body-text">Aucun produit dans l&apos;épicerie.</p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
