import { create } from "zustand";

interface FilterState {
  platformId: number | null;
  genreId: number | null;
  ordering: string;
  setPlatform: (id: number | null) => void;
  setGenre: (id: number | null) => void;
  setOrdering: (ordering: string) => void;
  reset: () => void;
}

const DEFAULT_ORDERING = "-rating";

export const useFilterStore = create<FilterState>((set) => ({
  platformId: null,
  genreId: null,
  ordering: DEFAULT_ORDERING,
  setPlatform: (id) => set({ platformId: id }),
  setGenre: (id) => set({ genreId: id }),
  setOrdering: (ordering) => set({ ordering }),
  reset: () => set({ platformId: null, genreId: null, ordering: DEFAULT_ORDERING }),
}));
