// UI contracts — what components consume. Never contains raw RAWG types.

export interface GenreVM {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformVM {
  id: number;
  name: string;
  slug: string;
  releaseYear: number | null;
}

export interface ScreenshotVM {
  id: number;
  url: string;
  width: number;
  height: number;
}

export interface StoreVM {
  id: number;
  name: string;
  url: string;
  domain: string;
}

export interface TagVM {
  id: number;
  name: string;
  slug: string;
}

/** Used in lists, carousels, search results */
export interface GameCardVM {
  id: number;
  slug: string;
  title: string;
  cover: string;
  released: string | null;
  year: number | null;
  rating: number;
  ratingCount: number;
  metacritic: number | null;
  genres: GenreVM[];
  platforms: PlatformVM[];
}

/** Used in the detail page */
export interface GameDetailVM extends GameCardVM {
  description: string;
  backgroundImage: string;
  screenshots: ScreenshotVM[];
  stores: StoreVM[];
  tags: TagVM[];
  trailers: TrailerVM[];
  soundtracks: SoundtrackVM[];
}

export interface TrailerVM {
  id: number;
  name: string;
  preview: string;
  videoLow: string;
  videoHigh: string;
}

export interface SoundtrackVM {
  id: string;
  name: string;
  embedUrl: string;
  platform: "spotify";
}

export interface ConsoleSectionVM {
  id: string;
  label: string;
  platformIds: number[];
  color: string;
}

export interface GamesPageVM {
  games: GameCardVM[];
  total: number;
  hasNext: boolean;
  page: number;
}
