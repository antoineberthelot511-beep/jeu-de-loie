"use client";

import type { Player } from "@/types/game";
import GameBoard from "@/components/GameBoard";
import Reveal from "@/components/Reveal";

type NarratorMapsProps = {
  players: Player[];
};

export default function NarratorMaps({ players }: NarratorMapsProps) {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full">
      <Reveal>
        <GameBoard players={players} />
      </Reveal>
    </div>
  );
}
