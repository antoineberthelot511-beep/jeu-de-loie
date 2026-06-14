export type Item = {
  id: string;
  name: string;
  price: number;
  image?: string;
  durability?: number;
  description?: string;
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
};

export type World = {
  id: "world1" | "world2" | "world3" | "world4";
  name: string;
  color: string; // couleur de secours si pas d'image
  portalImage?: string; // image affichée dans le hub
  sceneImage?: string; // décor affiché quand on est téléporté dedans
};
