"use client";

import { useCallback, useEffect, useState } from "react";
import type { Item, Player } from "@/types/game";

const PLAYERS_KEY = "players";
const TURN_KEY = "currentPlayerIndex";
const SHOP_ITEMS_KEY = "shopItems";

export function useGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [shopItems, setShopItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem(PLAYERS_KEY);
      if (savedPlayers) {
        const parsed: Player[] = JSON.parse(savedPlayers);
        // Migrate players saved before money/inventory existed
        setPlayers(
          parsed.map((p) => ({
            ...p,
            money: p.money ?? 100,
            inventory: p.inventory ?? [],
          }))
        );
      }

      const savedTurn = localStorage.getItem(TURN_KEY);
      if (savedTurn) setCurrentPlayerIndex(JSON.parse(savedTurn));

      const savedShopItems = localStorage.getItem(SHOP_ITEMS_KEY);
      if (savedShopItems) setShopItems(JSON.parse(savedShopItems));
    } catch (e) {
      console.warn("Failed to load game state from localStorage", e);
    }
    setLoaded(true);
  }, []);

  // Persist players whenever they change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }, [players, loaded]);

  // Persist current turn whenever it changes
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(TURN_KEY, JSON.stringify(currentPlayerIndex));
  }, [currentPlayerIndex, loaded]);

  // Persist shop items whenever they change
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(shopItems));
  }, [shopItems, loaded]);

  const currentPlayer = players[currentPlayerIndex];

  /**
   * Update the current player's location only.
   */
  const movePlayer = useCallback(
    (worldId: Player["location"]) => {
      if (players.length === 0) return;

      setPlayers((prev) =>
        prev.map((p, i) =>
          i === currentPlayerIndex ? { ...p, location: worldId } : p
        )
      );
    },
    [players.length, currentPlayerIndex]
  );

  /**
   * Advance the turn to the next player.
   */
  const nextTurn = useCallback(() => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  }, [players.length]);

  /**
   * Update location and then advance turn.
   */
  const teleportAndTurn = useCallback(
    (worldId: Player["location"]) => {
      if (players.length === 0) return;
      movePlayer(worldId);
      nextTurn();
    },
    [movePlayer, nextTurn, players.length]
  );

  /**
   * Add a new product to the shop's catalog.
   */
  const addShopItem = useCallback((item: Item) => {
    setShopItems((prev) => [...prev, item]);
  }, []);

  /**
   * Current player buys an item: deduct its price from their money and
   * add a copy to their inventory. Returns false if they can't afford it.
   */
  const buyItem = useCallback(
    (item: Item) => {
      const player = players[currentPlayerIndex];
      if (!player || player.money < item.price) return false;

      setPlayers((prev) =>
        prev.map((p, i) =>
          i === currentPlayerIndex
            ? {
                ...p,
                money: p.money - item.price,
                inventory: [...p.inventory, { ...item, id: crypto.randomUUID() }],
              }
            : p
        )
      );
      return true;
    },
    [players, currentPlayerIndex]
  );

  /**
   * Narrateur action: add an item to a specific player's inventory,
   * regardless of whose turn it is.
   *
   * If the target player is in Communisme Land (world1), every player
   * receives their own copy of the item ("propriété collective").
   * Returns true if the collective effect triggered.
   */
  const giveItem = useCallback(
    (playerId: string, item: Item) => {
      const target = players.find((p) => p.id === playerId);
      const isCollective = target?.location === "world1";

      setPlayers((prev) =>
        prev.map((p) =>
          isCollective || p.id === playerId
            ? { ...p, inventory: [...p.inventory, { ...item, id: crypto.randomUUID() }] }
            : p
        )
      );

      return isCollective;
    },
    [players]
  );

  /**
   * Narrateur action: remove an item from a specific player's inventory.
   */
  const removeItem = useCallback((playerId: string, itemId: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, inventory: p.inventory.filter((item) => item.id !== itemId) }
          : p
      )
    );
  }, []);

  /**
   * Narrateur action: adjust a player's money by a (positive or negative) amount.
   */
  const adjustMoney = useCallback((playerId: string, amount: number) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, money: Math.max(0, p.money + amount) } : p
      )
    );
  }, []);

  return {
    players,
    setPlayers,
    currentPlayer,
    currentPlayerIndex,
    movePlayer,
    nextTurn,
    teleportAndTurn,
    shopItems,
    addShopItem,
    buyItem,
    giveItem,
    removeItem,
    adjustMoney,
  };
}
