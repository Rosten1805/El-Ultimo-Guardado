"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { GameCardVM, GameDetailVM, GamesPageVM } from "@/types/viewModels";

interface UseGamesParams {
  platformIds?: number[];
  search?: string;
  ordering?: string;
  pageSize?: number;
}

export function useInfiniteGames({
  platformIds,
  search,
  ordering = "-rating",
  pageSize = 20,
}: UseGamesParams = {}) {
  const platforms = platformIds?.join(",");

  return useInfiniteQuery<GamesPageVM>({
    queryKey: ["games", { platforms, search, ordering, pageSize }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        page_size: String(pageSize),
        ordering,
      });
      if (platforms) params.set("platforms", platforms);
      if (search) params.set("search", search);

      const res = await fetch(`/api/games?${params}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });
}

export function useGames(params: UseGamesParams = {}) {
  const { platformIds, search, ordering = "-rating", pageSize = 20 } = params;
  const platforms = platformIds?.join(",");

  return useQuery<GamesPageVM>({
    queryKey: ["games-page", { platforms, search, ordering, pageSize }],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: "1",
        page_size: String(pageSize),
        ordering,
      });
      if (platforms) p.set("platforms", platforms);
      if (search) p.set("search", search);

      const res = await fetch(`/api/games?${p}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    },
  });
}

export function useGameDetail(slug: string) {
  return useQuery<GameDetailVM>({
    queryKey: ["game-detail", slug],
    queryFn: async () => {
      const res = await fetch(`/api/games/${slug}`);
      if (!res.ok) throw new Error("Game not found");
      return res.json();
    },
    enabled: !!slug,
  });
}

export function useFeaturedGames(count = 8): GameCardVM[] {
  const { data } = useGames({ ordering: "-metacritic", pageSize: count });
  return data?.games ?? [];
}
