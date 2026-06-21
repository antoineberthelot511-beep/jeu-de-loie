// Bibliothèque d'images par défaut affichée dans le panneau "Importer" de l'éditeur
// narrateur. Une entrée par fichier présent dans public/assets/ ; à régénérer
// manuellement si des images sont ajoutées ou retirées de ce dossier.

export interface DefaultAsset {
  name: string;
  src: string;
}

export const defaultAssets: DefaultAsset[] = [
  { name: "Coin", src: "/assets/coin.svg" },
  { name: "Heart", src: "/assets/heart.svg" },
  { name: "House", src: "/assets/house.svg" },
  { name: "Shield", src: "/assets/shield.svg" },
  { name: "Star", src: "/assets/star.svg" },
  { name: "Tree", src: "/assets/tree.svg" },
];
