// Maps the visual category sections (from tiken) to RAWG platform IDs

export interface ConsoleSection {
  id: string;
  label: string;
  shortLabel: string;
  platformIds: number[];
  accentColor: string;
  emoji: string;
}

export const CONSOLE_SECTIONS: ConsoleSection[] = [
  {
    id: "nes",
    label: "Nintendo Entertainment System",
    shortLabel: "NES",
    platformIds: [7],
    accentColor: "#e4000f",
    emoji: "🎮",
  },
  {
    id: "snes",
    label: "Super Nintendo",
    shortLabel: "SNES",
    platformIds: [79],
    accentColor: "#7a4cc4",
    emoji: "🕹️",
  },
  {
    id: "n64",
    label: "Nintendo 64",
    shortLabel: "N64",
    platformIds: [83],
    accentColor: "#009ac7",
    emoji: "🌟",
  },
  {
    id: "gba",
    label: "Game Boy Advance",
    shortLabel: "GBA",
    platformIds: [24],
    accentColor: "#8a2be2",
    emoji: "📱",
  },
  {
    id: "megadrive",
    label: "Sega Mega Drive / Genesis",
    shortLabel: "Mega Drive",
    platformIds: [167],
    accentColor: "#1a6bff",
    emoji: "⚡",
  },
  {
    id: "arcade",
    label: "Arcade",
    shortLabel: "Arcade",
    platformIds: [23],
    accentColor: "#ff6b35",
    emoji: "🕹️",
  },
  {
    id: "neogeo",
    label: "Neo Geo",
    shortLabel: "Neo Geo",
    platformIds: [12],
    accentColor: "#c0a020",
    emoji: "👾",
  },
  {
    id: "ps1",
    label: "PlayStation",
    shortLabel: "PS1",
    platformIds: [27],
    accentColor: "#003087",
    emoji: "🎯",
  },
  {
    id: "ps2",
    label: "PlayStation 2",
    shortLabel: "PS2",
    platformIds: [15],
    accentColor: "#00439c",
    emoji: "💿",
  },
];

export const PUBLISHER_CATEGORIES = [
  {
    id: "nintendo",
    label: "Nintendo",
    slug: "nintendo",
    color: "#e4000f",
  },
  {
    id: "sega",
    label: "Sega",
    slug: "sega",
    color: "#1a6bff",
  },
  {
    id: "capcom",
    label: "Capcom",
    slug: "capcom",
    color: "#0078d4",
  },
  {
    id: "konami",
    label: "Konami",
    slug: "konami",
    color: "#c8102e",
  },
  {
    id: "snk",
    label: "SNK / Neo Geo",
    slug: "snk",
    color: "#c0a020",
  },
  {
    id: "square",
    label: "Square Soft",
    slug: "square-soft",
    color: "#4a4a8a",
  },
];
