import type { CSSProperties } from "react";
import type { Theme } from "./types";

type PresetValues = Omit<Theme, "logo" | "cover">;

const base: Omit<PresetValues, "preset" | "colors" | "fonts" | "background"> = {
  fontScale: 1,
  radius: 14,
  spacing: "comfortable",
  layout: "classic",
  align: "left",
  cardStyle: "shadow",
  buttonShape: "rounded",
  buttonStyle: "solid",
};

export const PRESETS: { id: string; name: string; theme: PresetValues }[] = [
  {
    id: "minimal",
    name: "Minimal",
    theme: {
      ...base,
      preset: "minimal",
      colors: { background: "#F4F4F1", surface: "#FFFFFF", text: "#1C1C1A", muted: "#6B6B66", accent: "#4F46E5", buttonText: "#FFFFFF" },
      fonts: { heading: "Inter", body: "Inter" },
      background: { type: "color", value: "", overlay: 0 },
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    theme: {
      ...base,
      preset: "midnight",
      colors: { background: "#0B0D17", surface: "#151827", text: "#EDEEF5", muted: "#9497AD", accent: "#8B9CFF", buttonText: "#0B0D17" },
      fonts: { heading: "Space Grotesk", body: "Inter" },
      background: { type: "gradient", value: "radial-gradient(circle at 20% 0%, #2A2F5C 0%, #0B0D17 60%)", overlay: 0 },
      radius: 18,
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    theme: {
      ...base,
      preset: "sunset",
      colors: { background: "#FFE8D6", surface: "#FFFFFF", text: "#2B1B17", muted: "#7A5F57", accent: "#E8590C", buttonText: "#FFFFFF" },
      fonts: { heading: "Poppins", body: "DM Sans" },
      background: { type: "gradient", value: "linear-gradient(135deg, #FFD8B5 0%, #FFB4A2 50%, #E5989B 100%)", overlay: 0 },
      buttonShape: "pill",
      radius: 22,
    },
  },
  {
    id: "forest",
    name: "Forest",
    theme: {
      ...base,
      preset: "forest",
      colors: { background: "#E9EFE6", surface: "#FBFCF8", text: "#1D2B1F", muted: "#5D6E5F", accent: "#2F6B3B", buttonText: "#FFFFFF" },
      fonts: { heading: "Fraunces", body: "Work Sans" },
      background: { type: "color", value: "", overlay: 0 },
      radius: 8,
    },
  },
  {
    id: "editorial",
    name: "Editorial",
    theme: {
      ...base,
      preset: "editorial",
      colors: { background: "#F7F3EC", surface: "#F7F3EC", text: "#151515", muted: "#5E5A52", accent: "#151515", buttonText: "#F7F3EC" },
      fonts: { heading: "Playfair Display", body: "Lora" },
      background: { type: "color", value: "", overlay: 0 },
      radius: 0,
      cardStyle: "none",
      buttonShape: "square",
      spacing: "airy",
    },
  },
  {
    id: "bold",
    name: "Bold",
    theme: {
      ...base,
      preset: "bold",
      colors: { background: "#FFE14D", surface: "#FFFFFF", text: "#111111", muted: "#444444", accent: "#111111", buttonText: "#FFE14D" },
      fonts: { heading: "Archivo Black", body: "Archivo" },
      background: { type: "color", value: "", overlay: 0 },
      radius: 4,
      buttonShape: "square",
      layout: "one",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    theme: {
      ...base,
      preset: "ocean",
      colors: { background: "#DDF1F7", surface: "#FFFFFF", text: "#0D2A36", muted: "#4E6C78", accent: "#0E7490", buttonText: "#FFFFFF" },
      fonts: { heading: "Manrope", body: "Manrope" },
      background: { type: "gradient", value: "linear-gradient(180deg, #CDEBF5 0%, #F1FAFC 100%)", overlay: 0 },
      radius: 16,
    },
  },
  {
    id: "playful",
    name: "Playful",
    theme: {
      ...base,
      preset: "playful",
      colors: { background: "#F3E8FF", surface: "#FFFFFF", text: "#2E1A47", muted: "#6E5A87", accent: "#C026D3", buttonText: "#FFFFFF" },
      fonts: { heading: "Fredoka", body: "Nunito" },
      background: { type: "gradient", value: "linear-gradient(120deg, #E9D5FF 0%, #FBCFE8 100%)", overlay: 0 },
      radius: 24,
      buttonShape: "pill",
      layout: "one",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    theme: {
      ...base,
      preset: "lavender",
      colors: { background: "#EEEAF8", surface: "#FFFFFF", text: "#2A2440", muted: "#6D6787", accent: "#7C5CDB", buttonText: "#FFFFFF" },
      fonts: { heading: "DM Sans", body: "DM Sans" },
      background: { type: "color", value: "", overlay: 0 },
      radius: 18,
    },
  },
  {
    id: "rose",
    name: "Rose",
    theme: {
      ...base,
      preset: "rose",
      colors: { background: "#FBEFF1", surface: "#FFFFFF", text: "#3B1F27", muted: "#8A6670", accent: "#BE3455", buttonText: "#FFFFFF" },
      fonts: { heading: "Playfair Display", body: "Inter" },
      background: { type: "gradient", value: "linear-gradient(160deg, #FDE2E7 0%, #FBF4F0 100%)", overlay: 0 },
      align: "center",
      buttonShape: "pill",
      radius: 20,
    },
  },
  {
    id: "mint",
    name: "Mint",
    theme: {
      ...base,
      preset: "mint",
      colors: { background: "#E3F6EF", surface: "#FFFFFF", text: "#0F2E26", muted: "#557269", accent: "#0F9D74", buttonText: "#FFFFFF" },
      fonts: { heading: "Outfit", body: "Outfit" },
      background: { type: "gradient", value: "linear-gradient(135deg, #D4F5E9 0%, #F0FBF7 100%)", overlay: 0 },
      radius: 16,
    },
  },
  {
    id: "coffee",
    name: "Coffee",
    theme: {
      ...base,
      preset: "coffee",
      colors: { background: "#EFE6DA", surface: "#FBF7F1", text: "#3A2A1E", muted: "#7D6A5A", accent: "#8B5A3C", buttonText: "#FBF7F1" },
      fonts: { heading: "Lora", body: "Work Sans" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "border",
      radius: 10,
    },
  },
  {
    id: "slate",
    name: "Business",
    theme: {
      ...base,
      preset: "slate",
      colors: { background: "#EEF1F5", surface: "#FFFFFF", text: "#16202E", muted: "#5B6676", accent: "#1D4ED8", buttonText: "#FFFFFF" },
      fonts: { heading: "IBM Plex Sans", body: "IBM Plex Sans" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "border",
      radius: 6,
      spacing: "compact",
    },
  },
  {
    id: "mono",
    name: "Black & White",
    theme: {
      ...base,
      preset: "mono",
      colors: { background: "#FFFFFF", surface: "#FFFFFF", text: "#000000", muted: "#555555", accent: "#000000", buttonText: "#FFFFFF" },
      fonts: { heading: "Inter", body: "Inter" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "border",
      radius: 0,
      buttonShape: "square",
    },
  },
  {
    id: "neon",
    name: "Neon",
    theme: {
      ...base,
      preset: "neon",
      colors: { background: "#0A0A0A", surface: "#141414", text: "#F2F2F2", muted: "#9A9A9A", accent: "#C6FF3D", buttonText: "#0A0A0A" },
      fonts: { heading: "Space Grotesk", body: "Space Grotesk" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "border",
      radius: 12,
      layout: "one",
    },
  },
  {
    id: "aurora",
    name: "Aurora",
    theme: {
      ...base,
      preset: "aurora",
      colors: { background: "#0F1026", surface: "#181A3A", text: "#F1F0FF", muted: "#A9A7CC", accent: "#4FD1C5", buttonText: "#0F1026" },
      fonts: { heading: "Sora", body: "Inter" },
      background: { type: "gradient", value: "linear-gradient(135deg, #1A1446 0%, #0E3B4F 50%, #1B5E4F 100%)", overlay: 0 },
      radius: 20,
      buttonShape: "pill",
    },
  },
  {
    id: "retro",
    name: "Retro",
    theme: {
      ...base,
      preset: "retro",
      colors: { background: "#F6E7C8", surface: "#FFF8EA", text: "#2B2118", muted: "#6E5D4B", accent: "#D9480F", buttonText: "#FFF8EA" },
      fonts: { heading: "Rubik", body: "Rubik" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "border",
      radius: 14,
      buttonShape: "pill",
    },
  },
  {
    id: "notebook",
    name: "Notebook",
    theme: {
      ...base,
      preset: "notebook",
      colors: { background: "#FDFBF4", surface: "#FDFBF4", text: "#1F2A44", muted: "#5D6680", accent: "#2F5BD3", buttonText: "#FFFFFF" },
      fonts: { heading: "Caveat", body: "Nunito" },
      background: { type: "color", value: "", overlay: 0 },
      cardStyle: "none",
      fontScale: 1.05,
      radius: 8,
    },
  },
  {
    id: "candy",
    name: "Candy",
    theme: {
      ...base,
      preset: "candy",
      colors: { background: "#FFF1C9", surface: "#FFFFFF", text: "#3A1D3F", muted: "#7A5F7E", accent: "#F2387C", buttonText: "#FFFFFF" },
      fonts: { heading: "Fredoka", body: "Nunito" },
      background: { type: "gradient", value: "linear-gradient(135deg, #FFE29F 0%, #FFA99F 50%, #FF719A 100%)", overlay: 0 },
      radius: 26,
      buttonShape: "pill",
      align: "center",
    },
  },
  {
    id: "sky",
    name: "Sky",
    theme: {
      ...base,
      preset: "sky",
      colors: { background: "#E6F0FF", surface: "#FFFFFF", text: "#13233F", muted: "#5A6B88", accent: "#2563EB", buttonText: "#FFFFFF" },
      fonts: { heading: "Sora", body: "Inter" },
      background: { type: "gradient", value: "linear-gradient(180deg, #BFD8FF 0%, #EEF4FF 70%)", overlay: 0 },
      radius: 18,
    },
  },
];

export const FONTS = [
  "Inter", "DM Sans", "Manrope", "Work Sans", "Poppins", "Montserrat", "Nunito", "Outfit", "Sora",
  "Space Grotesk", "IBM Plex Sans", "Rubik", "Raleway", "Archivo", "Archivo Black", "Fredoka",
  "Playfair Display", "Fraunces", "Lora", "Merriweather", "Libre Baskerville", "Caveat",
];

export const GRADIENTS = [
  "linear-gradient(135deg, #FFD8B5 0%, #FFB4A2 50%, #E5989B 100%)",
  "linear-gradient(120deg, #E9D5FF 0%, #FBCFE8 100%)",
  "linear-gradient(180deg, #CDEBF5 0%, #F1FAFC 100%)",
  "linear-gradient(135deg, #D4FC79 0%, #96E6A1 100%)",
  "radial-gradient(circle at 20% 0%, #2A2F5C 0%, #0B0D17 60%)",
  "linear-gradient(135deg, #1F1C2C 0%, #928DAB 100%)",
  "linear-gradient(160deg, #FDE2E7 0%, #FBF4F0 100%)",
  "linear-gradient(135deg, #D4F5E9 0%, #F0FBF7 100%)",
  "linear-gradient(180deg, #BFD8FF 0%, #EEF4FF 70%)",
  "linear-gradient(135deg, #FFE29F 0%, #FFA99F 50%, #FF719A 100%)",
  "linear-gradient(135deg, #1A1446 0%, #0E3B4F 50%, #1B5E4F 100%)",
  "linear-gradient(135deg, #F6E7C8 0%, #EBC8A0 100%)",
];

export function presetTheme(id: string): Theme {
  const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0];
  return { ...structuredClone(p.theme), logo: null, cover: null };
}

/** Apply a preset while keeping the user's own uploads (logo, cover). */
export function applyPreset(current: Theme, id: string): Theme {
  return { ...presetTheme(id), logo: current.logo, cover: current.cover };
}

const GAP = { compact: "18px", comfortable: "28px", airy: "42px" };
const BTN_RADIUS = { square: "4px", rounded: "10px", pill: "999px" };

export function themeStyle(t: Theme): CSSProperties {
  return {
    "--f-bg": t.colors.background,
    "--f-surface": t.colors.surface,
    "--f-text": t.colors.text,
    "--f-muted": t.colors.muted,
    "--f-accent": t.colors.accent,
    "--f-btn-text": t.colors.buttonText,
    "--f-radius": `${t.radius}px`,
    "--f-btn-radius": BTN_RADIUS[t.buttonShape],
    "--f-gap": GAP[t.spacing],
    "--f-scale": String(t.fontScale),
    "--f-heading": `"${t.fonts.heading}"`,
    "--f-body": `"${t.fonts.body}"`,
  } as CSSProperties;
}

export function backgroundStyle(t: Theme): CSSProperties {
  if (t.background.type === "gradient" && t.background.value) return { background: t.background.value };
  if (t.background.type === "image" && t.background.value)
    return { backgroundImage: `url("${t.background.value}")`, backgroundSize: "cover", backgroundPosition: "center" };
  return { background: t.colors.background };
}

export function googleFontsHref(fonts: string[]): string {
  const families = [...new Set(fonts)].map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`);
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

function luminance(hex: string): number {
  const m = hex.replace("#", "").match(/.{2}/g);
  if (!m || m.length < 3) return 0;
  const [r, g, b] = m.slice(0, 3).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
