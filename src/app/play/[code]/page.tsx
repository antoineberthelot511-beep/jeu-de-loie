"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ShapeType = "rect" | "circle" | "triangle" | "star" | "line";
type ElementType = "text" | "image" | "pawn" | ShapeType;

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
  playerId?: string;
  playerName?: string;
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

// Écrit le pion déplacé dans Supabase au plus une fois tous les PAWN_WRITE_THROTTLE_MS
// pendant le drag, plus une écriture finale au relâchement pour ne rien perdre.
const PAWN_WRITE_THROTTLE_MS = 120;

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const code = (params?.code ?? "").toUpperCase();

  const [gameId, setGameId] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [canvasBg, setCanvasBg] = useState("#ffffff");
  const [diceRoll, setDiceRoll] = useState<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<CanvasElement[]>([]);
  elementsRef.current = elements;

  useEffect(() => {
    setMyPlayerId(localStorage.getItem("playerId"));
  }, []);

  // Trouve la partie via son code et charge le plateau déjà enregistré
  useEffect(() => {
    if (!code) return;
    let active = true;

    (async () => {
      const { data, error } = await supabase
        .from("games")
        .select("id, board, dice_roll")
        .eq("code", code)
        .maybeSingle();

      if (!active || error || !data) return;
      setGameId(data.id);
      const board = data.board as Board | null;
      setElements(board?.elements ?? []);
      setCanvasBg(board?.canvasBg ?? "#ffffff");
      setDiceRoll((data.dice_roll as number | null) ?? null);
    })();

    return () => {
      active = false;
    };
  }, [code]);

  // Abonnement temps réel : reflète chaque Enregistrer du narrateur (et les pions
  // déplacés par les autres joueurs)
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game-board-${gameId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games", filter: `id=eq.${gameId}` },
        (payload) => {
          const row = payload.new as { board: Board | null; dice_roll: number | null };
          setElements(row.board?.elements ?? []);
          setCanvasBg(row.board?.canvasBg ?? "#ffffff");
          setDiceRoll(row.dice_roll ?? null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  function persistPawnPosition(id: string, x: number, y: number) {
    if (!gameId) return;
    const nextElements = elementsRef.current.map((el) => (el.id === id ? { ...el, x, y } : el));
    elementsRef.current = nextElements;
    void supabase
      .from("games")
      .update({ board: { elements: nextElements, canvasBg } })
      .eq("id", gameId);
  }

  function handlePawnPointerDown(e: React.PointerEvent, el: CanvasElement) {
    if (el.playerId !== myPlayerId) return;
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cw = rect.width;
    const ch = rect.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;
    let lastWrite = 0;
    let lastX = startElX;
    let lastY = startElY;

    function clamp(v: number) {
      return Math.min(100, Math.max(0, v));
    }

    function onMove(ev: PointerEvent) {
      const dx = ((ev.clientX - startX) / cw) * 100;
      const dy = ((ev.clientY - startY) / ch) * 100;
      lastX = clamp(startElX + dx);
      lastY = clamp(startElY + dy);
      setElements((prev) => prev.map((p) => (p.id === el.id ? { ...p, x: lastX, y: lastY } : p)));

      const now = Date.now();
      if (now - lastWrite > PAWN_WRITE_THROTTLE_MS) {
        lastWrite = now;
        persistPawnPosition(el.id, lastX, lastY);
      }
    }

    function onUp() {
      persistPawnPosition(el.id, lastX, lastY);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

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
        ref={canvasRef}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: canvasBg,
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        {diceRoll !== null && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 4,
              background: "#fff",
              color: "#0d1216",
              fontWeight: 800,
              fontSize: 16,
              width: 32,
              height: 32,
              borderRadius: 8,
              boxShadow: "0 3px 10px rgba(0,0,0,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Dernier résultat du dé"
          >
            🎲{diceRoll}
          </div>
        )}
        {elements.map((el) => {
          const isMine = el.type === "pawn" && el.playerId === myPlayerId;
          return (
            <div
              key={el.id}
              onPointerDown={el.type === "pawn" ? (e) => handlePawnPointerDown(e, el) : undefined}
              style={{
                position: "absolute",
                left: el.type === "pawn" ? `${el.x}%` : el.x,
                top: el.type === "pawn" ? `${el.y}%` : el.y,
                width: el.type === "pawn" ? `${el.w}%` : el.w,
                height: el.type === "pawn" ? `${el.h}%` : el.h,
                cursor: isMine ? "grab" : undefined,
                touchAction: el.type === "pawn" ? "none" : undefined,
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
              ) : el.type === "pawn" ? (
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: isMine ? "3px solid #ffd400" : "3px solid #fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,.4)",
                      background: el.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {el.src ? (
                      <img
                        src={el.src}
                        alt=""
                        draggable={false}
                        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                      />
                    ) : (
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: "min(3vw, 22px)", pointerEvents: "none" }}>
                        {(el.playerName ?? "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      marginTop: 3,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#0d1216",
                      background: "#fff",
                      padding: "1px 7px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      pointerEvents: "none",
                    }}
                  >
                    {el.playerName}
                  </span>
                </div>
              ) : (
                renderShapeContent(el)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
