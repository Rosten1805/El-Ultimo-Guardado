"use client";

import useEmblaCarousel from "embla-carousel-react";

export interface TikenCollection {
  title: string;
  consoleFolder: string;
  games: ReadonlyArray<{ console: string; file: string; alt: string }>;
}

export function CollectionCarousel({ collection }: { collection: TikenCollection }) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    align: "start",
    containScroll: "trimSnaps",
  });

  return (
    <div
      style={{
        marginInlineStart: "4rem",
        marginBlockStart: "2rem",
      }}
    >
      <h2
        style={{
          fontSize: "0.975rem",
          fontWeight: 400,
          lineHeight: "1.4",
          color: "var(--profile-menu-text)",
          marginBlockStart: "1.375rem",
          letterSpacing: "0.11px",
          marginBlockEnd: "1rem",
        }}
      >
        {collection.title}
      </h2>

      <div
        ref={emblaRef}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          position: "relative",
          height: "100%",
          width: "100%",
          paddingBlockEnd: "0.5rem",
          overflow: "hidden",
        }}
      >
        <ul
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "0.5rem",
          }}
        >
          {collection.games.map((game) => (
            <li
              key={game.file}
              className="movie-carousel-item"
              style={{ width: "140px", flexShrink: 0 }}
            >
              <img
                className="movie-carousel-cover"
                src={`/covers/${game.console}/${game.file}`}
                alt={game.alt}
                loading="lazy"
                width={600}
                height={900}
                style={{ width: "100%", height: "auto", borderRadius: "4px", display: "block" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PlatformSection({ collection }: { collection: TikenCollection }) {
  return <CollectionCarousel collection={collection} />;
}
