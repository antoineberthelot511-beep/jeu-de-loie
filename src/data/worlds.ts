import type { World } from "@/types/game";

export const worlds: World[] = [
  {
    id: "world1",
    name: "Communisme Land",
    color: "#3b82f6",
    portalImage: "/worlds/communisme-portail.jpg",
    sceneImage: "/worlds/communisme-monde.jpg",
  },
  {
    id: "world2",
    name: "Capitaliste Land",
    color: "#ef4444",
    portalImage: "/worlds/meth.jpg",
    sceneImage: "/worlds/capitaliste-monde.jpg",
  },
  { id: "world3", name: "Nerdland", color: "#22c55e", portalImage: "/worlds/nerdland-portail.jpg", sceneImage: "/worlds/nerdland-monde.jpg" },
  { id: "world4", name: "Monde 4", color: "#f59e0b" },
];
