import type { Case } from '@/types/game';
import Image from 'next/image';

type BoardProps = {
  board: Case[];
  playerPositions: number[]; // array of case ids where each player is
  onCaseClick?: (c: Case) => void;
};

export default function Board({ board, playerPositions, onCaseClick }: BoardProps) {
  // Generate spiral coordinates for n cases
  const getSpiralCoords = (n: number): [number, number][] => {
    const coords: [number, number][] = [[0, 0]]; // starting at center for case 1
    if (n === 1) return coords;

    let x = 0,
      y = 0;
    let step = 1; // length of current segment
    let stepCount = 0; // steps taken in current direction
    let dir = 0; // 0:right, 1:up, 2:left, 3:down
    // directions: right, up, left, down
    const dx = [1, 0, -1, 0];
    const dy = [0, -1, 0, 1];

    for (let i = 2; i <= n; i++) {
      x += dx[dir];
      y += dy[dir];
      coords.push([x, y]);
      stepCount++;
      if (stepCount === step) {
        stepCount = 0;
        dir = (dir + 1) % 4;
        // increase step length after every two direction changes (right/up then left/down)
        if (dir % 2 === 0) {
          step++;
        }
      }
    }
    return coords;
  };

  const coords = getSpiralCoords(board.length);
  // Determine bounds to shift to positive grid area
  let minX = 0,
    maxX = 0,
    minY = 0,
    maxY = 0;
  coords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  const offsetX = -minX;
  const offsetY = -minY;
  const gridWidth = maxX - minX + 1;
  const gridHeight = maxY - minY + 1;

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-square">
      {/* CSS Grid container */}
      <div
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
          gridTemplateRows: `repeat(${gridHeight}, 1fr)`,
        }}
      >
        {board.map((cell, index) => {
          const i = index; // 0-based
          const [x, y] = coords[i];
          const col = x + offsetX + 1; // grid lines start at 1
          const row = y + offsetY + 1;
          // Determine players on this cell
          const playersHere = playerPositions
            .map((pos, playerIdx) => ({ pos, playerIdx }))
            .filter((p) => p.pos === cell.id);

          return (
            <div
              key={cell.id}
              className={`relative flex flex-col items-center justify-center p-2 transition-colors hover:scale-105`}
              style={{
                gridColumn: col.toString(),
                gridRow: row.toString(),
                backgroundColor: cell.color,
                borderRadius: '0.5rem',
                cursor: onCaseClick ? 'pointer' : 'default',
              }}
              onClick={onCaseClick ? () => onCaseClick(cell) : undefined}
            >
              {/* Image if exists */}
              {cell.image && (
                <Image
                  src={cell.image}
                  alt={cell.label}
                  width={64}
                  height={64}
                  className="mb-2"
                />
              )}
              {/* Number and label */}
              <div className="text-center text-sm font-medium text-gray-800">
                <div className="font-bold">{cell.id}</div>
                <div>{cell.label}</div>
              </div>
              {/* Player tokens */}
              {playersHere.map(({ playerIdx }) => (
                <div
                  key={playerIdx}
                  className="absolute left-0 top-0 -mt-2 -ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gray-300 shadow"
                >
                  {/* Simple player indicator: number or color */}
                  <span className="text-xs font-bold">{playerIdx + 1}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}