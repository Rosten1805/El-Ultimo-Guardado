"use client";

import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import type { ConsoleSection } from "@/lib/consoleSections";
import type { GameCardVM, GamesPageVM } from "@/types/viewModels";

const PLACEHOLDER = "/images/placeholder-cover.webp";
const SLIDES_VISIBLE = 6;
const GAP = "0.75rem";

async function fetchPlatformGames(platformIds: number[], page: number): Promise<GamesPageVM> {
  const params = new URLSearchParams({
    platforms: platformIds.join(","),
    page: String(page),
    page_size: "40",
    ordering: "-metacritic",
    metacritic: "1,100",
    exclude_additions: "true",
  });
  const res = await fetch(`/api/games?${params}`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}

async function fetchPopularGames(platformIds: number[], page: number): Promise<GamesPageVM> {
  const params = new URLSearchParams({
    platforms: platformIds.join(","),
    page: String(page),
    page_size: "40",
    ordering: "-added",
    exclude_additions: "true",
  });
  const res = await fetch(`/api/games?${params}`);
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}

function mergeUnique(a: GameCardVM[], b: GameCardVM[]): GameCardVM[] {
  const seen = new Set(a.map((g) => g.id));
  return [...a, ...b.filter((g) => !seen.has(g.id))];
}

function GameSlide({ game, priority, didDrag }: { game: GameCardVM; priority?: boolean; didDrag: React.RefObject<boolean> }) {
  const router = useRouter();

  return (
    <Link
      href={`/games/${game.slug}`}
      onMouseEnter={() => router.prefetch(`/games/${game.slug}`)}
      onClick={(e) => { if (didDrag.current) e.preventDefault(); }}
      aria-label={`${game.title}${game.year ? `, ${game.year}` : ""}`}
      className="movie-carousel-item"
      style={{ display: "block", textDecoration: "none", width: "100%" }}
    >
      {/* Cover — full image visible, no cropping */}
      <div
        className="game-cover-wrapper"
        style={{
          width: "100%",
          aspectRatio: "3 / 4",
          background: "#0d0d0d",
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative",
          transition: "outline-color 0.2s ease",
        }}
      >
        <Image
          src={game.cover || PLACEHOLDER}
          alt={`Portada de ${game.title}`}
          fill
          sizes={`calc((100vw - 4rem) / ${SLIDES_VISIBLE})`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          style={{
            objectFit: "contain",
            objectPosition: "center",
          }}
        />

        {/* Metacritic badge */}
        {game.metacritic !== null && (
          <span
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              fontSize: "0.6rem",
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: "4px",
              backdropFilter: "blur(6px)",
              background:
                game.metacritic >= 75
                  ? "rgba(34,197,94,0.85)"
                  : game.metacritic >= 50
                    ? "rgba(234,179,8,0.85)"
                    : "rgba(239,68,68,0.85)",
              color: "#fff",
            }}
          >
            {game.metacritic}
          </span>
        )}
      </div>

      {/* Title — always visible */}
      <div style={{ padding: "0.4rem 0.1rem 0" }}>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontWeight: 600,
          }}
        >
          {game.title}
        </p>
        {game.year && (
          <p
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.45)",
              margin: "3px 0 0",
            }}
          >
            {game.year}
          </p>
        )}
      </div>
    </Link>
  );
}

function SkeletonSlides() {
  return (
    <>
      {Array.from({ length: SLIDES_VISIBLE }).map((_, i) => (
        <li
          key={i}
          style={{
            flex: `0 0 calc((100% - ${SLIDES_VISIBLE - 1} * ${GAP}) / ${SLIDES_VISIBLE})`,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              borderRadius: "6px",
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.1) 50%,rgba(255,255,255,0.05) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.8s infinite",
            }}
          />
          <div
            style={{
              height: "0.7rem",
              marginTop: "0.4rem",
              borderRadius: "3px",
              background: "rgba(255,255,255,0.07)",
              width: "80%",
            }}
          />
        </li>
      ))}
    </>
  );
}

export function PlatformSection({ section }: { section: ConsoleSection }) {
  const didDrag = useRef(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    dragFree: true,
    align: "start",
    containScroll: "trimSnaps",
  });

  useEffect(() => {
    if (!emblaApi) return;
    const onPointerDown = () => { didDrag.current = false; };
    const onScroll      = () => { didDrag.current = true; };
    const onSettle      = () => { didDrag.current = false; };
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("scroll", onScroll);
    emblaApi.on("settle", onSettle);
    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("scroll", onScroll);
      emblaApi.off("settle", onSettle);
    };
  }, [emblaApi]);

  const mc1 = useQuery({
    queryKey: ["platform-mc", section.id, 1],
    queryFn: () => fetchPlatformGames(section.platformIds, 1),
    staleTime: 10 * 60 * 1000,
  });
  const mc2 = useQuery({
    queryKey: ["platform-mc", section.id, 2],
    queryFn: () => fetchPlatformGames(section.platformIds, 2),
    staleTime: 10 * 60 * 1000,
    enabled: mc1.data?.hasNext === true,
  });
  const pop1 = useQuery({
    queryKey: ["platform-pop", section.id, 1],
    queryFn: () => fetchPopularGames(section.platformIds, 1),
    staleTime: 10 * 60 * 1000,
    enabled: mc1.isSuccess,
  });

  const mcGames  = mergeUnique(mc1.data?.games ?? [], mc2.data?.games ?? []);
  const games    = mergeUnique(mcGames, pop1.data?.games ?? []).slice(0, 50);
  const isLoading = mc1.isLoading;

  return (
    <div style={{ marginInline: "4rem", marginBlockStart: "2.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBlockEnd: "1.25rem" }}>
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#f9f9f9",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {section.label}
        </h2>
        {games.length > 0 && (
          <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
            {games.length} juegos
          </span>
        )}
      </div>

      {/* Carousel */}
      <div
        ref={emblaRef}
        style={{ overflow: "hidden", padding: "6px", cursor: "grab" }}
      >
        <ul
          style={{
            display: "flex",
            gap: GAP,
            margin: 0,
            padding: 0,
            listStyle: "none",
          }}
        >
          {isLoading ? (
            <SkeletonSlides />
          ) : games.length === 0 ? (
            <li style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
              Sin juegos disponibles
            </li>
          ) : (
            games.map((game, i) => (
              <li
                key={game.id}
                style={{
                  flex: `0 0 calc((100% - ${SLIDES_VISIBLE - 1} * ${GAP}) / ${SLIDES_VISIBLE})`,
                  minWidth: 0,
                }}
              >
                <GameSlide game={game} priority={i < SLIDES_VISIBLE} didDrag={didDrag} />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
