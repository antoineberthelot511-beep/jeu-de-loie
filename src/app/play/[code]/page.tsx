"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ShapeType = "rect" | "circle" | "triangle" | "star" | "line";
type ElementType = "text" | "image" | ShapeType;

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  text?: string;
  fontSize?: number;
  bold?: boolean;
  src?: string;
}

interface Board {
  elements?: CanvasElement[];
  canvasBg?: string;
}

function renderShapeContent(el: CanvasElement) {
  switch (el.type) {
    case "rect":
      return <div style={{ width: "100%", height: "100%", background: el.color }} />;
    case "circle":
      return <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: el.color }} />;
    case "triangle":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 98,98 2,98" fill={el.color} />
        </svg>
      );
    case "star":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,3 61,38 98,38 68,59 79,95 50,73 21,95 32,59 2,38 39,38" fill={el.color} />
        </svg>
      );
    case "line":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="2" y1="50" x2="98" y2="50" stroke={el.color} strokeWidth="6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params?.code ?? "").toUpperCase();

  const [gameId, setGameId] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);

  // Trouve la partie via son code et charge le plateau déjà enregistré
  useEffect(() => {
    if (!code) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, board")
        .eq("code", code)
        .maybeSingle();

      if (!active || error || !data) return;
      setGameId(data.id);
      setBoard(data.board as Board | null);
    })();

    return () => {
      active = false;
    };
  }, [code]);

  // Abonnement temps réel : reflète chaque Enregistrer du narrateur
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-board-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const row = payload.new as { board: Board | null };
          setBoard(row.board ?? null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const elements = board?.elements ?? [];
  const canvasBg = board?.canvasBg ?? "#ffffff";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0d1216",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: canvasBg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
            }}
          >
            {el.type === "text" ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  fontSize: el.fontSize,
                  fontWeight: el.bold ? 700 : 400,
                  color: el.color,
                  overflow: "hidden",
                }}
              >
                {el.text}
              </div>
            ) : el.type === "image" ? (
              <img
                src={el.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              renderShapeContent(el)
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
