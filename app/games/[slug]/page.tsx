import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeGameDetail, normalizeGame } from "@/lib/normalizer";
import { rawgFetch } from "@/lib/rawgClient";
import type { RAWGGame, RAWGListResponse, RAWGScreenshot, RAWGStore, RAWGMovie } from "@/types/rawg";
import type { GameDetailVM, GameCardVM } from "@/types/viewModels";
import { Header } from "@/components/layout/Header";
import { VideoPlayer } from "@/components/game/VideoPlayer";

async function getGameDetail(slug: string): Promise<GameDetailVM | null> {
  try {
    const [gameRes, screenshotsRes, storesRes, moviesRes] = await Promise.allSettled([
      rawgFetch<RAWGGame>(`/games/${slug}`),
      rawgFetch<RAWGListResponse<RAWGScreenshot>>(`/games/${slug}/screenshots`),
      rawgFetch<RAWGListResponse<RAWGStore>>(`/games/${slug}/stores`),
      rawgFetch<RAWGListResponse<RAWGMovie>>(`/games/${slug}/movies`),
    ]);
    if (gameRes.status === "rejected") return null;
    return normalizeGameDetail(
      gameRes.value,
      screenshotsRes.status === "fulfilled" ? screenshotsRes.value.results : [],
      storesRes.status === "fulfilled" ? storesRes.value.results : [],
      moviesRes.status === "fulfilled" ? moviesRes.value.results : [],
    );
  } catch {
    return null;
  }
}

async function getRelatedGames(genreSlug: string, excludeSlug: string): Promise<GameCardVM[]> {
  try {
    const data = await rawgFetch<RAWGListResponse<RAWGGame>>("/games", {
      genres: genreSlug,
      ordering: "-metacritic",
      page_size: "6",
      exclude_additions: "true",
    });
    return data.results
      .filter((g) => g.slug !== excludeSlug && !!g.background_image)
      .slice(0, 3)
      .map(normalizeGame);
  } catch {
    return [];
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameDetail(slug);
  if (!game) return { title: "Juego no encontrado" };
  const description = game.description.replace(/<[^>]+>/g, "").slice(0, 160);
  return {
    title: `${game.title} | El Último Guardado`,
    description,
    openGraph: { title: game.title, description, images: [{ url: game.backgroundImage }] },
  };
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = await getGameDetail(slug);
  if (!game) notFound();

  const firstGenre = game.genres[0];
  const relatedGames = firstGenre ? await getRelatedGames(firstGenre.slug, slug) : [];

  const firstPlatform = game.platforms[0]?.name ?? null;
  const hasTrailer = game.trailers.length > 0;
  const trailer = game.trailers[0];
  const firstScreenshot = game.screenshots[0]?.url ?? game.backgroundImage;

  return (
    <>
      <Header />

      <main style={{ paddingInline: "4rem", paddingTop: "2.5rem", paddingBottom: "5rem", minHeight: "100vh" }}>
        {/* Back */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.8rem",
            marginBottom: "1.5rem",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={undefined}
        >
          ← Volver
        </Link>

        {/* 3-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 300px", gap: "2rem", alignItems: "start" }}>

          {/* ── LEFT COLUMN ── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Platform tag */}
            {firstPlatform && (
              <span className="console-tag" style={{ width: "fit-content" }}>
                {firstPlatform}
              </span>
            )}

            {/* Title */}
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#f9f9f9", lineHeight: 1.1, margin: 0 }}>
              {game.title}
            </h1>

            {/* Dev + Released */}
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {game.developer && (
                <p><strong style={{ color: "rgba(255,255,255,0.75)" }}>Dev:</strong> {game.developer}</p>
              )}
              {game.released && (
                <p><strong style={{ color: "rgba(255,255,255,0.75)" }}>Released:</strong> {formatDate(game.released)}</p>
              )}
            </div>

            {/* Genre tags */}
            {game.genres.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {game.genres.map((g) => (
                  <span key={g.id} className="console-tag">{g.name}</span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <button style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.5rem 1rem", borderRadius: "6px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Likes
              </button>
              <button style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                padding: "0.5rem 1rem", borderRadius: "6px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", cursor: "pointer",
              }}>
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Add to Library
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "2rem", paddingTop: "0.5rem" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "2rem", fontWeight: 900, color: "#f9f9f9", lineHeight: 1 }}>0</p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>Likes</p>
              </div>
              {game.metacritic && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "2rem", fontWeight: 900, color: game.metacritic >= 75 ? "#22c55e" : game.metacritic >= 50 ? "#eab308" : "#ef4444", lineHeight: 1 }}>
                    {game.metacritic}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "0.2rem" }}>Metacritic</p>
                </div>
              )}
            </div>

            {/* Divider */}
            <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0.25rem 0" }} />

            {/* Description */}
            {game.description && (
              <p style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.7,
                display: "-webkit-box",
                WebkitLineClamp: 10,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}>
                {game.description.replace(/<[^>]+>/g, "")}
              </p>
            )}
          </aside>

          {/* ── CENTER COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Media player */}
            {hasTrailer ? (
              <VideoPlayer
                src={trailer.videoHigh || trailer.videoLow}
                poster={trailer.preview}
                fallbackImage={firstScreenshot}
              />
            ) : (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#000" }}>
                <Image
                  src={firstScreenshot}
                  alt={`${game.title} screenshot`}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 1400px) 60vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Related games */}
            {relatedGames.length > 0 && firstGenre && (
              <section>
                <h2 style={{
                  fontSize: "0.75rem", fontWeight: 800, color: "#f9f9f9",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem",
                }}>
                  Juegos relacionados — {firstGenre.name}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  {relatedGames.map((rg) => (
                    <Link
                      key={rg.id}
                      href={`/games/${rg.slug}`}
                      style={{ textDecoration: "none", display: "block" }}
                    >
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "#111" }}>
                        <Image
                          src={rg.cover}
                          alt={rg.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="200px"
                        />
                        {/* Platform badge */}
                        {rg.platforms[0] && (
                          <span style={{
                            position: "absolute", bottom: "6px", right: "6px",
                            fontSize: "0.55rem", fontWeight: 700, padding: "2px 6px",
                            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
                            borderRadius: "3px", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em",
                          }}>
                            {rg.platforms[0].name}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "#f9f9f9", fontWeight: 600, marginTop: "0.5rem", lineHeight: 1.3 }}>
                        {rg.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Screenshots strip */}
            {game.screenshots.length > 1 && (
              <section>
                <h2 style={{
                  fontSize: "0.75rem", fontWeight: 800, color: "#f9f9f9",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "1rem",
                }}>
                  Screenshots
                </h2>
                <div style={{ display: "flex", gap: "0.6rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
                  {game.screenshots.slice(0, 8).map((sc) => (
                    <div key={sc.id} style={{ position: "relative", flexShrink: 0, width: "180px", height: "100px", borderRadius: "6px", overflow: "hidden", background: "#111" }}>
                      <Image src={sc.url} alt="screenshot" fill style={{ objectFit: "cover" }} sizes="180px" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Cover image */}
            <div style={{
              position: "relative", width: "100%", aspectRatio: "3/4",
              borderRadius: "10px", overflow: "hidden", background: "#0d0d0d",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}>
              <Image
                src={game.cover}
                alt={`Portada de ${game.title}`}
                fill
                style={{ objectFit: "contain", objectPosition: "center" }}
                sizes="300px"
                priority
              />
            </div>

            {/* Stores */}
            {game.stores.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Disponible en
                </p>
                {game.stores.map((store) => (
                  <a
                    key={store.id}
                    href={store.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.5rem 0.75rem", borderRadius: "6px",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                  >
                    {store.name}
                    <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            )}

            {/* Tags */}
            {game.tags.length > 0 && (
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>
                  Tags
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {game.tags.map((t) => (
                    <span key={t.id} className="console-tag" style={{ fontSize: "0.6rem" }}>{t.name}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
