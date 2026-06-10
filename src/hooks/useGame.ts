import { useState, useCallback } from 'react';
import type { Case } from '@/types/game';
import { board as defaultBoard } from '@/data/board';
import * as GameLogic from '@/lib/gameLogic';

export type GameState = ReturnType<typeof GameLogic.initializeGame>;

export function useGame(initialPlayerCount: number = 2, board: Case[] = defaultBoard) {
  const [state, setState] = useState<GameState>(() =>
    GameLogic.initializeGame(initialPlayerCount, board)
  );

  const rollDice = useCallback(() => {
    if (state.isOver) return;

    const dice = GameLogic.rollDice();
    setState((prev) => ({
      ...prev,
      diceValue: dice,
      log: [...prev.log, `Joueur ${prev.currentPlayerIndex + 1} lance le dé : ${dice}`],
    }));

    const playerId = state.currentPlayerIndex;
    const player = state.players[playerId];

    // Move player
    const newPos = GameLogic.movePosition(player.position, dice);
    setState((prev) => {
      const players = [...prev.players];
      players[playerId] = { ...players[playerId], position: newPos };
      return {
        ...prev,
        players,
        log: [...prev.log, `Joueur ${playerId + 1} avance de ${dice} et arrive sur la case ${newPos}`],
      };
    });

    // Apply case effect
    setState((prev) => {
      const players = [...prev.players];
      players[playerId] = { ...players[playerId], position: prev.players[playerId].position };
      // We'll work on a copy of state to apply effect
      const tempState: GameLogic.GameState = {
        players,
        currentPlayerIndex: prev.currentPlayerIndex,
        log: [...prev.log],
        diceValue: prev.diceValue,
        isOver: prev.isOver,
        winner: prev.winner,
      };
      GameLogic.applyCaseEffect(tempState, playerId, board);
      // Check victory after effect
      GameLogic.checkVictory(tempState);
      // Determine if we need to skip turn or roll again
      let justRolledAgain = false;
      let skipTurn = false;
      const effect = board.find((c) => c.id === tempState.players[playerId].position)?.effect;
      switch (effect?.type) {
        case 'rejoue':
          justRolledAgain = true;
          break;
        case 'passe_tour':
          skipTurn = true;
          break;
        default:
          break;
      }
      // Advance turn unless roll again
      if (!justRolledAgain) {
        if (skipTurn) {
          // skip one turn: advance twice
          tempState.currentPlayerIndex =
            (tempState.currentPlayerIndex + 2) % tempState.players.length;
        } else {
          tempState.currentPlayerIndex =
            (tempState.currentPlayerIndex + 1) % tempState.players.length;
        }
      }
      return {
        ...tempState,
        // diceValue cleared after turn ends? keep until next roll? we keep until next roll.
      };
    });
  }, [state, board]);

  const resetGame = useCallback((playerCount: number) => {
    setState(GameLogic.initializeGame(playerCount, board));
  }, [board]);

  return { state, rollDice, resetGame };
}