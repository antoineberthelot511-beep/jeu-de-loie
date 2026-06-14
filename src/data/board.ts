export type NodeType = "start" | "event" | "epicerie" | "fin";

export type Node = {
  id: number; // ordre sur le parcours (0 = départ)
  x: number; // position horizontale sur la map, en %
  y: number; // position verticale, en %
  type: NodeType;
  label: string; // nom de la case
  event?: string; // description de l'événement
};

export const board: Node[] = [
  {
    id: 0,
    x: 6,
    y: 88,
    type: "start",
    label: "Départ",
    event: "Le parcours commence ici. Bonne chance !",
  },
  {
    id: 1,
    x: 16,
    y: 74,
    type: "event",
    label: "Forêt mystérieuse",
    event: "Un bruit étrange retentit dans les buissons... perds 1 vie ou fuis en lâchant un objet.",
  },
  {
    id: 2,
    x: 29,
    y: 82,
    type: "event",
    label: "Pont de bois",
    event: "Le pont craque sous tes pas. Lance une pièce : pile tu passes, face tu recules d'une case.",
  },
  {
    id: 3,
    x: 40,
    y: 66,
    type: "event",
    label: "Carrefour perdu",
    event: "Tu hésites entre deux chemins. Le narrateur choisit ta prochaine destination.",
  },
  {
    id: 4,
    x: 52,
    y: 76,
    type: "event",
    label: "Marécage gluant",
    event: "Tes pieds s'enfoncent dans la boue. Passe ton prochain tour à te dépêtrer.",
  },
  {
    id: 5,
    x: 62,
    y: 58,
    type: "epicerie",
    label: "Épicerie du village",
    event: "Fais le plein de provisions : achète ou échange des objets avec le marchand.",
  },
  {
    id: 6,
    x: 51,
    y: 44,
    type: "event",
    label: "Colline venteuse",
    event: "Une bourrasque te pousse en arrière. Recule d'une case.",
  },
  {
    id: 7,
    x: 63,
    y: 30,
    type: "event",
    label: "Grotte sombre",
    event: "Il fait nuit noire. Trouve un objet caché ou affronte une créature.",
  },
  {
    id: 8,
    x: 76,
    y: 40,
    type: "event",
    label: "Ruines anciennes",
    event: "D'anciens trésors t'attendent... mais aussi peut-être un piège.",
  },
  {
    id: 9,
    x: 86,
    y: 26,
    type: "event",
    label: "Tour de guet",
    event: "Du sommet, tu repères le chemin le plus court. Avance d'une case supplémentaire.",
  },
  {
    id: 10,
    x: 73,
    y: 14,
    type: "event",
    label: "Sommet brumeux",
    event: "Le froid mord tes mains. Perds 1 vie pour continuer, ou attends un tour au chaud.",
  },
  {
    id: 11,
    x: 56,
    y: 6,
    type: "fin",
    label: "Arrivée",
    event: "Bravo, tu as terminé le parcours !",
  },
];
