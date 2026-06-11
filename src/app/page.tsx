"use client";

import PlayerSetup from "@/components/PlayerSetup";
import Hub from "@/components/Hub";
import World from "@/components/World";
import { useGame } from "@/hooks/useGame";
import { worlds } from "@/data/worlds";

export default function Page() {
  const { players, setPlayers, currentPlayer, teleportCurrentPlayer } =
    useGame();

  if (players.length === 0) {
    return <PlayerSetup onComplete={setPlayers} />;
  }

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 sm:p-6">
      <header className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold">
          C&apos;est au tour de {currentPlayer?.name}
        </h1>
      </header>

      <Hub
        players={players}
        onSelectWorld={(world) => teleportCurrentPlayer(world.id)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
        {worlds.map((world) => (
          <World key={world.id} world={world} players={players} />
        ))}
      </div>
    </div>
  );
}
