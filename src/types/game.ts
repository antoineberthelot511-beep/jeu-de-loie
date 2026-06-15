export type Item = {
  id: string;
  name: string;
  price: number;
  image?: string;
  durability?: number;
  description?: string;
  // Stock restant dans l'épicerie. `undefined` = stock illimité (compat anciens produits).
  quantity?: number;
};

export type Player = {
  id: string;
  name: string;
  image: string;
  location: "hub" | "world1" | "world2" | "world3" | "world4";
  money: number;
  life: number;
  inventory: Item[];
  narratorMessage?: string | null;
  posX: number;
  posY: number;
  croqueCount: number;
  nodeIndex: number;
  combatAction: "attack" | null;
  inGoulag: boolean;
  // Résultat de la Roue du Chaos pour le tour en cours (1-6), null = pas encore lancé.
  roll: number | null;
  // Vrai si le joueur a déjà avancé pendant le tour en cours.
  hasMoved: boolean;
};

export type Combat = {
  active: boolean;
  bossName: string;
  bossHp: number;
  bossMaxHp: number;
  round: number;
  log: string[];
  victory?: boolean;
};

export const DEFAULT_COMBAT: Combat = {
  active: false,
  bossName: "",
  bossHp: 0,
  bossMaxHp: 0,
  round: 0,
  log: [],
};

export type World = {
  id: "world1" | "world2" | "world3" | "world4";
  name: string;
  color: string; // couleur de secours si pas d'image
  portalImage?: string; // image affichée dans le hub
  sceneImage?: string; // décor affiché quand on est téléporté dedans
};
