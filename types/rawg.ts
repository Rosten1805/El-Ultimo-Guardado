// Raw types from RAWG API — never expose these to components directly

export interface RAWGPlatformRef {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
  released_at: string | null;
}

export interface RAWGGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RAWGTag {
  id: number;
  name: string;
  slug: string;
  language: string;
}

export interface RAWGStore {
  id: number;
  store: {
    id: number;
    name: string;
    slug: string;
    domain: string;
  };
  url: string;
}

export interface RAWGScreenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

export interface RAWGGame {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  description_raw: string | null;
  released: string | null;
  background_image: string | null;
  background_image_additional: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  genres: RAWGGenre[];
  platforms: RAWGPlatformRef[] | null;
  tags: RAWGTag[] | null;
  short_screenshots?: RAWGScreenshot[];
}

export interface RAWGListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RAWGMovieClip {
  "320": string;
  "640": string;
  full: string;
}

export interface RAWGMovie {
  id: number;
  name: string;
  preview: string;
  data: RAWGMovieClip;
}

export interface RAWGPlatform {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  image_background: string | null;
  games_count: number;
  year_start: number | null;
  year_end: number | null;
}
