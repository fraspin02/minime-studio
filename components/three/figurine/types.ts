export type HairStyle = "long" | "curly" | "short" | "bun";
export type Outfit = "tee" | "crop" | "hoodie" | "dress" | "gown";
export type Accessory = "none" | "glasses" | "cap" | "partyhat" | "gradcap" | "flower";
export type Pose = "stand" | "wave" | "cheer" | "hips" | "hold" | "hugNeck" | "hugWaist";
export type Held = "none" | "diploma" | "cake" | "bouquet";

export interface FigureConfig {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  outfit: Outfit;
  topColor: string;
  bottomColor: string;
  shoeColor: string;
  accessory: Accessory;
  accessoryColor: string;
  pose: Pose;
  held?: Held;
}

export const SKIN = {
  light: "#f3cfb3",
  warm: "#e6b48f",
  tan: "#cf9a72",
  deep: "#94603f",
};

export const PRESETS = {
  /** The hero character — curly hair, black tee, cream trousers. */
  hero: {
    skin: SKIN.warm,
    hair: "curly",
    hairColor: "#2b211c",
    outfit: "tee",
    topColor: "#1f1f22",
    bottomColor: "#ece5d8",
    shoeColor: "#fbfaf7",
    accessory: "none",
    accessoryColor: "#a58bfa",
    pose: "stand",
  },
  her: {
    skin: SKIN.warm,
    hair: "long",
    hairColor: "#2a201b",
    outfit: "crop",
    topColor: "#bfd2ec",
    bottomColor: "#f6f3ee",
    shoeColor: "#fbfaf7",
    accessory: "none",
    accessoryColor: "#a58bfa",
    pose: "hugNeck",
  },
  him: {
    skin: SKIN.warm,
    hair: "curly",
    hairColor: "#2b211c",
    outfit: "tee",
    topColor: "#1f1f22",
    bottomColor: "#ece5d8",
    shoeColor: "#fbfaf7",
    accessory: "none",
    accessoryColor: "#a58bfa",
    pose: "hugWaist",
  },
  graduate: {
    skin: SKIN.light,
    hair: "short",
    hairColor: "#6b4630",
    outfit: "gown",
    topColor: "#2d2b3f",
    bottomColor: "#2d2b3f",
    shoeColor: "#3a3530",
    accessory: "gradcap",
    accessoryColor: "#2d2b3f",
    pose: "hold",
    held: "diploma",
  },
  friendA: {
    skin: SKIN.tan,
    hair: "bun",
    hairColor: "#1f1a17",
    outfit: "dress",
    topColor: "#ffe29a",
    bottomColor: "#ffe29a",
    shoeColor: "#fbfaf7",
    accessory: "flower",
    accessoryColor: "#f6a9bf",
    pose: "cheer",
  },
  friendB: {
    skin: SKIN.light,
    hair: "short",
    hairColor: "#c08a4e",
    outfit: "hoodie",
    topColor: "#a58bfa",
    bottomColor: "#3c4a66",
    shoeColor: "#fbfaf7",
    accessory: "glasses",
    accessoryColor: "#242424",
    pose: "wave",
  },
  petOwner: {
    skin: SKIN.deep,
    hair: "curly",
    hairColor: "#16110f",
    outfit: "hoodie",
    topColor: "#f9dce5",
    bottomColor: "#ece5d8",
    shoeColor: "#fbfaf7",
    accessory: "cap",
    accessoryColor: "#a58bfa",
    pose: "hips",
  },
  birthday: {
    skin: SKIN.light,
    hair: "long",
    hairColor: "#8a5a3b",
    outfit: "dress",
    topColor: "#f9dce5",
    bottomColor: "#f9dce5",
    shoeColor: "#fbfaf7",
    accessory: "partyhat",
    accessoryColor: "#a58bfa",
    pose: "hold",
    held: "cake",
  },
} satisfies Record<string, FigureConfig>;
