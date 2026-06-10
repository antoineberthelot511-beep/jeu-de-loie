import type { Case } from '@/types/game';
import type { GameState } from '@/hooks/useGame';

type GameControlsProps = {
  state: GameState;
  rollDice: () => void;
  resetGame: (playerCount: number) => void;
};

export default function GameControls({ state, rollDice, resetGame }: GameControlsProps) {
  const handleRoll = () => {
    rollDice();
  };

  const handleReset = () => {
    // Ask for player count? For simplicity reset to 2 players
    resetGame(2);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Contrôles de jeu</h2>

      {!state.isOver ? (
        <div className="mb-4">
          <span className="font-medium">Joueur courant : </span>
          <span className="ml-2 text-blue-600">
            Joueur {state.currentPlayerIndex + 1}
          </span>
        </div>
      ) : (
        <div className="mb-4 text-green-600 font-bold">
          🎉 Joueur {state.winner! + 1} a gagné !
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
        <button
          onClick={handleRoll}
          disabled={state.isOver}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {state.isOver ? 'Partie terminée' : 'Lancer le dé'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Nouvelle partie
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-medium mb-2">Log des coups</h3>
        <div className="max-h-40 overflow-y-auto text-sm text-gray-700 space-y-1">
          {state.log
            .slice()
            .reverse()
            .map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
        </div>
      </div>
    </div>
  );
}