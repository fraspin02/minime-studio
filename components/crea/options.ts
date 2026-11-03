import type { Accessory, FigureConfig, HairStyle, Outfit, Pose } from "@/components/three/figurine/types";
import { SKIN } from "@/components/three/figurine/types";

export const HAIR: { v: HairStyle; l: string }[] = [
  { v: "curly", l: "Ricci" },
  { v: "long", l: "Lunghi" },
  { v: "short", l: "Corti" },
  { v: "bun", l: "Chignon" },
];

export const HAIR_COLORS = ["#2b211c", "#6b4630", "#a8713f", "#d9b06c", "#c4593b", "#b9b3ad", "#a58bfa"];

export const OUTFITS: { v: Outfit; l: string }[] = [
  { v: "tee", l: "T-shirt" },
  { v: "hoodie", l: "Felpa" },
  { v: "crop", l: "Top e gonna" },
  { v: "dress", l: "Vestito" },
  { v: "gown", l: "Toga" },
];

export const OUTFIT_COLORS = ["#1f1f22", "#fbfaf7", "#a58bfa", "#ffe29a", "#f9dce5", "#bfd2ec", "#9fc49a", "#d4584f"];
export const BOTTOM_COLORS = ["#ece5d8", "#3c4a66", "#1f1f22", "#f6f3ee", "#c9b8f5", "#9b7b5c"];

export const SKINS = [
  { v: SKIN.light, l: "Chiara" },
  { v: SKIN.warm, l: "Media" },
  { v: SKIN.tan, l: "Ambrata" },
  { v: SKIN.deep, l: "Scura" },
];

export const ACCESSORIES: { v: Accessory; l: string }[] = [
  { v: "none", l: "Nessuno" },
  { v: "glasses", l: "Occhiali" },
  { v: "cap", l: "Cappellino" },
  { v: "flower", l: "Fiore" },
  { v: "partyhat", l: "Festa" },
  { v: "gradcap", l: "Tocco" },
];

export const POSES: { v: Pose; l: string }[] = [
  { v: "stand", l: "In piedi" },
  { v: "wave", l: "Saluta" },
  { v: "cheer", l: "Evviva!" },
  { v: "hips", l: "Mani sui fianchi" },
  { v: "hold", l: "Con fiori" },
];

export const DEFAULT_CONFIG: FigureConfig = {
  skin: SKIN.warm,
  hair: "curly",
  hairColor: "#2b211c",
  outfit: "tee",
  topColor: "#a58bfa",
  bottomColor: "#ece5d8",
  shoeColor: "#fbfaf7",
  accessory: "none",
  accessoryColor: "#242424",
  pose: "wave",
  held: "none",
};

export const ACCESSORY_COLOR: Record<Accessory, string> = {
  none: "#242424",
  glasses: "#242424",
  cap: "#a58bfa",
  flower: "#f6a9bf",
  partyhat: "#a58bfa",
  gradcap: "#2d2b3f",
};
