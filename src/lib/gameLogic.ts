import type { Case } from '@/types/game';
import type { board } from '@/data/board';

export type Effect = {
  type: 'avance' | 'recule' | 'passe_tour' | 'rejoue' | 'retour_depart';
  value?: number;
  message?: string;
};

export type Player = {
  id: number; // 0-based index for internal use
  position: number; // case id (1-63)
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  log: string[];
  diceValue: number | null;
  isOver: boolean;
  winner: number | null; // player id (0-based) who won
};

/**
 * Initialize a new game
 * @param playerCount number of players (2-4)
 * @param boardCases the board data (array of Case)
 */
export function initializeGame(
  playerCount: number,
  boardCases: Case[]
): GameState {
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('Player count must be between 2 and 4');
  }
  const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
    id: i,
    position: 1, // start at case 1
  }));
  return {
    players,
    currentPlayerIndex: 0,
    log: [`Party démarrée avec ${playerCount} joueurs`],
    diceValue: null,
    isOver: false,
    winner: null,
  };
}

/**
 * Roll a die (1-6)
 */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Move a player by steps, with bounce-back if exceeds 63
 * @param position current position (1-63)
 * @param steps steps to move (positive)
 * @returns new position (1-63)
 */
export function movePosition(position: number, steps: number): number {
  let newPos = position + steps;
  if (newPos > 63) {
    const excess = newPos - 63;
    newPos = 63 - excess;
    if (newPos < 1) newPos = 1;
  }
  return newPos;
}

/**
 * Apply the effect of a case to the game state
 * @param state current game state (will be mutated)
 * @param playerId id of the player who landed
 * @param boardCases board data to get the case effect
 */
export function applyCaseEffect(
  state: GameState,
  playerId: number,
  boardCases: Case[]
): void {
  const player = state.players[playerId];
  const currentCase = boardCases.find((c) => c.id === player.position);
  if (!currentCase?.effect) return;

  const effect = currentCase.effect;
  let logMsg = '';

  switch (effect.type) {
    case 'avance':
      const advance = effect.value ?? 0;
      if (advance !== 0) {
        player.position = movePosition(player.position, advance);
        logMsg = `joueur ${playerId + 1} avance de ${advance} case(s)`;
      }
      break;
    case 'recule':
      const retreat = effect.value ?? 0;
      if (retreat !== 0) {
        player.position = movePosition(player.position, -retreat);
        logMsg = `joueur ${playerId + 1} recule de ${retreat} case(s)`;
      }
      break;
    case 'passe_tour':
      logMsg = `joueur ${playerId + 1} perd son tour`;
      // We'll handle skip turn in the turn logic
      break;
    case 'rejoue':
      logMsg = `joueur ${playerId + 1} rejoue`;
      // Handled in turn logic: do not advance turn
      break;
    case 'retour_depart':
      player.position = 1;
      logMsg = `joueur ${playerId + 1} revient au départ`;
      break;
    default:
      break;
  }

  if (logMsg) {
    state.log.push(logMsg);
    // Keep log size reasonable
    if (state.log.length > 50) state.log.shift();
  }
}

/**
 * Advance to the next player, considering skip turn and roll again
 * @param state current game state (will be mutated)
 */
export function advanceTurn(
  state: GameState,
  justRolledAgain: boolean
): void {
  if (justRolledAgain) {
    // same player rolls again, do nothing
    return;
  }
  // skip turn logic: if we need to skip, we will have stored a flag?
  // For simplicity, we handle passe_tour by advancing an extra step later.
  // We'll rely on caller to set a skip flag.
  // Here we just move to next player.
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;
}

/**
 * Check if any player has won (reached case 63)
 * @param state current game state
 * @returns true if game over, also sets winner and isOver
 */
export function checkVictory(state: GameState): boolean {
  for const p of state.players {
    if (p.position === 63) {
      state.isOver = true;
      state.winner = p.id;
      state.log.push(`🎉 Joueur ${p.id + 1} a atteint la case 63 et gagne !`);
      return true;
    }
  }
  return false;
}