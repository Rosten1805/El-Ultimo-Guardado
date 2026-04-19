// Pure transformation layer — no React, no Next.js, no side effects.
import type {
  RAWGGame,
  RAWGPlatform,
  RAWGScreenshot,
  RAWGStore,
  RAWGMovie,
} from "@/types/rawg";
import type {
  GameCardVM,
  GameDetailVM,
  PlatformVM,
  ScreenshotVM,
  StoreVM,
  TrailerVM,
} from "@/types/viewModels";
import { STORE_ID_MAP } from "./storeIdMap";

const PLACEHOLDER = "/images/placeholder-cover.webp";

function safeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return PLACEHOLDER;
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function extractYear(released: string | null | undefined): number | null {
  if (!released) return null;
  const year = parseInt(released.slice(0, 4), 10);
  return isNaN(year) || year < 1970 ? null : year;
}

function normalizePlatforms(raw: RAWGGame["platforms"]): PlatformVM[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((entry) => ({
    id: entry.platform.id,
    name: entry.platform.name,
    slug: entry.platform.slug,
    releaseYear: extractYear(entry.released_at),
  }));
}

export function normalizeGame(raw: RAWGGame): GameCardVM {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.name,
    cover: safeUrl(raw.background_image),
    released: raw.released ?? null,
    year: extractYear(raw.released),
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    ratingCount: raw.ratings_count ?? 0,
    metacritic: raw.metacritic ?? null,
    genres: (raw.genres ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
    })),
    platforms: normalizePlatforms(raw.platforms),
  };
}

export function normalizeTrailers(movies: RAWGMovie[]): TrailerVM[] {
  return movies.map((m) => ({
    id: m.id,
    name: m.name,
    preview: safeUrl(m.preview),
    videoLow: safeUrl(m.data?.["320"]),
    videoHigh: safeUrl(m.data?.full ?? m.data?.["640"]),
  }));
}

export function normalizeGameDetail(
  raw: RAWGGame,
  screenshots: RAWGScreenshot[] = [],
  stores: RAWGStore[] = [],
  movies: RAWGMovie[] = [],
): GameDetailVM {
  const base = normalizeGame(raw);

  const normalizedStores: StoreVM[] = stores.map((s) => {
    const meta = STORE_ID_MAP[s.store.id] ?? {
      name: s.store.name,
      domain: s.store.domain,
    };
    return {
      id: s.store.id,
      name: meta.name,
      url: s.url.startsWith("http") ? s.url : `https://${s.url}`,
      domain: meta.domain,
    };
  });

  const normalizedScreenshots: ScreenshotVM[] = screenshots.map((sc) => ({
    id: sc.id,
    url: safeUrl(sc.image),
    width: sc.width,
    height: sc.height,
  }));

  const normalizedTrailers = normalizeTrailers(movies);

  const rawDesc = raw.description_raw ?? raw.description ?? "";

  return {
    ...base,
    description: rawDesc,
    backgroundImage: safeUrl(
      raw.background_image_additional ?? raw.background_image,
    ),
    screenshots: normalizedScreenshots,
    stores: normalizedStores,
    tags: (raw.tags ?? [])
      .filter((t) => t.language === "eng")
      .slice(0, 10)
      .map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
    trailers: normalizedTrailers,
    soundtracks: [],
    developer: raw.developers?.[0]?.name ?? null,
  };
}

export function normalizePlatform(raw: RAWGPlatform): PlatformVM & {
  gamesCount: number;
  backgroundImage: string;
} {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    releaseYear: raw.year_start ?? null,
    gamesCount: raw.games_count,
    backgroundImage: safeUrl(raw.image_background),
  };
}
