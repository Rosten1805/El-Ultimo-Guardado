"use client";

import Link from "next/link";

const CATEGORIES = [
  { slug: "sega", label: "Sega", img: "/categories/img/sega.png", video: "/categories/video/sega.webm" },
  { slug: "nintendo", label: "Nintendo", img: "/categories/img/nintendo.png", video: "/categories/video/nintendo.webm" },
  { slug: "capcom", label: "Capcom", img: "/categories/img/capcom.png", video: "/categories/video/capcom.webm" },
  { slug: "konami", label: "Konami", img: "/categories/img/konami.png", video: "/categories/video/konami.webm" },
  { slug: "square-soft", label: "Square Soft", img: "/categories/img/square-soft.png", video: "/categories/video/square-soft.webm" },
  { slug: "neo-geo", label: "Neo Geo", img: "/categories/img/neo-geo.png", video: "/categories/video/neo-geo.webm" },
];

export function CategoryCards() {
  return (
    <section
      style={{ marginBlockStart: "0.5rem", height: "100%" }}
      aria-label="Browse by publisher"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          gap: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "0 auto",
          paddingInline: "4rem",
          marginBlockStart: "1rem",
        }}
      >
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/?publisher=${cat.slug}`}
            className="categorie-card"
            aria-label={cat.label}
          >
            <img
              className="categorie-card-img"
              src={cat.img}
              alt={cat.label}
            />
            <video
              className="categorie-card-video"
              src={cat.video}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
