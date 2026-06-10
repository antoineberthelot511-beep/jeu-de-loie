import { useState, useEffect } from 'react';
import { board as initialBoard } from '@/data/board';
import Board from '@/components/Board';
import GameControls from '@/components/GameControls';
import CaseEditor from '@/components/CaseEditor';
import { useGame } from '@/hooks/useGame';
import type { Case } from '@/types/game';

export default function Page() {
  // Load board from localStorage if exists, else use default
  const [boardState, setBoardState] = useState<Case[]>(() => {
    const saved = localStorage.getItem('board-oie');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Basic validation: ensure it's an array with length 63 and each has id
        if (Array.isArray(parsed) && parsed.length === 63) {
          return parsed as Case[];
        }
      } catch (e) {
        console.warn('Failed to parse board from localStorage', e);
      }
    }
    return initialBoard;
  });

  // Persist boardState to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('board-oie', JSON.stringify(boardState));
  }, [boardState]);

  const [editMode, setEditMode] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const { state: gameState, rollDice, resetGame } = useGame(2, boardState);

  const handleCaseClick = (c: Case) => {
    if (editMode) {
      setSelectedCaseId(c.id);
    }
  };

  const handleCaseSave = (updatedCase: Case) => {
    setBoardState((prev) =>
      prev.map((c) => (c.id === updatedCase.id ? updatedCase : c))
    );
    setSelectedCaseId(null);
  };

  const handleCaseCancel = () => {
    setSelectedCaseId(null);
  };

  // Reset board to default
  const handleResetBoard = () => {
    setBoardState(initialBoard);
  };

  // Export board as JSON file
  const handleExportBoard = () => {
    const dataStr = JSON.stringify(boardState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'board-oie.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import board from JSON file
  const handleImportBoard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length === 63) {
          setBoardState(parsed as Case[]);
        } else {
          alert('Format de plateau invalide');
        }
      } catch (err) {
        alert('Erreur lors de la lecture du JSON');
      }
    };
    reader.readAsText(file);
    // Reset input value to allow re-selecting same file
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with title and edit toggle */}
      <header className="flex flex-col items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Jeu de l'oie</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">Mode édition :</span>
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className={`px-3 py-1 rounded ${
              editMode ? 'bg-green-500 text-white' : 'bg-gray-300'
            } hover:${editMode ? 'bg-green-600' : 'bg-gray-400'}`}
          >
            {editMode ? 'Activé' : 'Désactivé'}
          </button>

          {/* Board management buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleResetBoard}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Réinitialiser le plateau
            </button>
            <button
              onClick={handleExportBoard}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Exporter en JSON
            </button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportBoard}
            />
            <label
              htmlFor=""
              onClick={() => {
                // Trigger file input via a hidden element
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = handleImportBoard;
                input.click();
              }}
              className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm"
            >
              Importer un JSON
            </label>
          </div>
        </div>
      </header>

      {/* Main content: board and controls */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Board
            board={boardState}
            playerPositions={gameState.players.map((p) => p.position)}
            onCaseClick={editMode ? handleCaseClick : undefined}
          />
        </div>

        {/* Game controls */}
        <div className="lg:col-span-1">
          <GameControls state={gameState} rollDice={rollDice} resetGame={resetGame} />
        </div>
      </main>

      {/* Case Editor modal (appears when selectedCaseId is set) */}
      {selectedCaseId !== null && (
        <CaseEditor
          case={boardState.find((c) => c.id === selectedCaseId)!}
          onSave={handleCaseSave}
          onCancel={handleCaseCancel}
        />
      )}
    </div>
  );
}