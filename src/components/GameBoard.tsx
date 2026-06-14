"use client";

import Image from "next/image";
import type { Player } from "@/types/game";
import { board } from "@/data/board";

type GameBoardProps = {
  players: Player[];
};

const NODE_STYLES: Record<string, { background: string; color: string }> = {
  start: { background: "var(--success)", color: "#ffffff" },
  fin: { background: "var(--danger)", color: "#ffffff" },
  epicerie: { background: "var(--bg-card)", color: "var(--text-primary)" },
  event: { background: "var(--secondary-soft)", color: "var(--text-primary)" },
};

export default function GameBoard({ players }: GameBoardProps) {
  const pathPoints = board.map((node) => `${node.x},${node.y}`).join(" ");

  return (
    <div
      className="relative w-full rounded-[22px] overflow-hidden comic-panel"
      style={{
        aspectRatio: "4 / 5",
        background: "var(--bg-card-soft)",
        border: "var(--border-thick)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Chemin reliant les cases */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <polyline
          points={pathPoints}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.35"
          strokeWidth="2"
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Cases du parcours */}
      {board.map((node) => {
        const style = NODE_STYLES[node.type] ?? NODE_STYLES.event;

        return (
          <div
            key={node.id}
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "12px",
                background: style.background,
                border: "3px solid var(--ink)",
                boxShadow: "var(--shadow-card-sm)",
              }}
            >
              {node.type === "epicerie" ? (
                <Image
                  src="/photojeu/epicerie-exterieur.jpg"
                  alt={node.label}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              ) : (
                <span
                  className="text-sm"
                  style={{ color: style.color, fontFamily: "var(--font-display)" }}
                >
                  {node.id}
                </span>
              )}
            </div>

            <span
              className="text-[10px] font-bold text-center leading-tight max-w-[4.5rem]"
              style={{ color: "var(--text-primary)" }}
            >
              {node.label}
            </span>
          </div>
        );
      })}

      {/* Avatars des joueurs, sur la case correspondant à leur node_index */}
      {players.map((player) => {
        const node = board.find((n) => n.id === player.nodeIndex) ?? board[0];
        const sameNode = players.filter((p) => p.nodeIndex === player.nodeIndex);
        const indexHere = sameNode.findIndex((p) => p.id === player.id);
        const offset = (indexHere - (sameNode.length - 1) / 2) * 8;

        return (
          <div
            key={player.id}
            className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: `translate(calc(-50% + ${offset}px), calc(-50% - 1.6rem))`,
              transition: "left 0.4s var(--ease-apple), top 0.4s var(--ease-apple)",
              zIndex: 10,
            }}
          >
            {player.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- base64 data URL, next/image doesn't support it
              <img src={player.image} alt={player.name} className="avatar-circle w-8 h-8" />
            ) : (
              <span className="avatar-placeholder w-8 h-8">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
