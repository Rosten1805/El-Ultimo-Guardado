"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GameCardVM } from "@/types/viewModels";
import { Star } from "lucide-react";

interface GameCardProps {
  game: GameCardVM;
  priority?: boolean;
}

export function GameCard({ game, priority = false }: GameCardProps) {
  const router = useRouter();

  return (
    <Link
      href={`/games/${game.slug}`}
      onMouseEnter={() => router.prefetch(`/games/${game.slug}`)}
      className="game-card-hover block relative rounded overflow-hidden bg-[#1a1a1a] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
      aria-label={`${game.title}${game.year ? `, ${game.year}` : ""}`}
    >
      {/* Cover image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={game.cover}
          alt={`Cover de ${game.title}`}
          fill
          sizes="(min-width: 1920px) 220px, (min-width: 1440px) 190px, (min-width: 1280px) 165px, 150px"
          className="object-cover object-top transition-transform duration-300"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />

        {/* Metacritic badge */}
        {game.metacritic !== null && (
          <div
            className={`absolute top-2 right-2 glass-tag text-xs font-bold ${
              game.metacritic >= 75
                ? "text-green-400"
                : game.metacritic >= 50
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
            aria-label={`Metacritic score: ${game.metacritic}`}
          >
            {game.metacritic}
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Info below */}
      <div className="p-2">
        <h3 className="text-white text-xs font-medium leading-tight truncate">
          {game.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-white/40 text-xs">{game.year ?? "—"}</span>
          {game.rating > 0 && (
            <span
              className="flex items-center gap-0.5 text-yellow-400 text-xs"
              aria-label={`Rating: ${game.rating.toFixed(1)} out of 5`}
            >
              <Star size={10} fill="currentColor" />
              {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Platform badges — max 3 */}
        {game.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5" aria-label="Platforms">
            {game.platforms.slice(0, 3).map((p) => (
              <span key={p.id} className="glass-tag" style={{ fontSize: "0.55rem" }}>
                {p.name.replace("PlayStation", "PS").replace("Nintendo", "").trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
