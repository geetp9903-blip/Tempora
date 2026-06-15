export const COLOR_PRESETS = {
  sunset: {
    name: "Sunset Glow",
    colors: ["#7c3aed", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#8b5cf6", "#a855f7", "#d946ef"]
  },
  ocean: {
    name: "Ocean Breeze",
    colors: ["#2563eb", "#3b82f6", "#06b6d4", "#0d9488", "#10b981", "#34d399", "#60a5fa", "#67e8f9"]
  },
  pastel: {
    name: "Pastel Garden",
    colors: ["#d8b4fe", "#fbcfe8", "#fecdd3", "#ffedd5", "#fef08a", "#bbf7d0", "#cffafe", "#bfdbfe"]
  },
  cyber: {
    name: "Neon Cyber",
    colors: ["#00f0ff", "#ff007f", "#39ff14", "#bd00ff", "#ffff00", "#ff5f00", "#ccff00", "#0080ff"]
  },
  forest: {
    name: "Forest Earth",
    colors: ["#86efac", "#a3e635", "#15803d", "#ca8a04", "#c2410c", "#b45309", "#eab308", "#166534"]
  },
  minimal: {
    name: "Slate Minimal",
    colors: ["#334155", "#475569", "#64748b", "#78716c", "#94a3b8", "#cbd5e1", "#0f766e", "#1e293b"]
  },
  royal: {
    name: "Royal Velvet",
    colors: ["#581c87", "#1e3a8a", "#991b1b", "#064e3b", "#881337", "#166534", "#b45309", "#7c2d12"]
  }
};

export type PresetKey = keyof typeof COLOR_PRESETS;
