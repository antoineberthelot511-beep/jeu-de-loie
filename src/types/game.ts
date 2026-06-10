type Effect = {
  type: "avance" | "recule" | "passe_tour" | "rejoue" | "retour_depart";
  value?: number;
  message?: string;
};
type Case = {
  id: number;
  label: string;
  color: string;
  image?: string;
  effect?: Effect;
};