import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeGameDetail } from "@/lib/normalizer";
import { rawgFetch } from "@/lib/rawgClient";
import type {
  RAWGGame,
  RAWGListResponse,
  RAWGScreenshot,
  RAWGStore,
  RAWGMovie,
} from "@/types/rawg";
import type { GameDetailVM } from "@/types/viewModels";
import { Star, ExternalLink, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ScreenshotGallery } from "@/components/game/ScreenshotGallery";

async function getGameDetail(slug: string): Promise<GameDetailVM | null> {
  try {
    const [gameRes, screenshotsRes, storesRes, moviesRes] =
      await Promise.allSettled([
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameDetail(slug);
  if (!game) return { title: "Game not found" };

  const description = game.description.replace(/<[^>]+>/g, "").slice(0, 160);

  return {
    title: `${game.title} | romSphere`,
    description,
    openGraph: {
      title: game.title,
      description,
      images: [{ url: game.backgroundImage, width: 1280, height: 720 }],
    },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGameDetail(slug);

  if (!game) notFound();

  const ratingPercent = Math.round((game.rating / 5) * 100);

  return (
    <>
      <Header />

      <main>
        {/* Hero background */}
        <div className="relative h-[50vh] lg:h-[65vh] overflow-hidden">
          <Image
            src={game.backgroundImage}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/30" />

          {/* Back button */}
          <div className="absolute top-20 left-6 lg:left-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded"
              aria-label="Back to home"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
          </div>

          {/* Cover portrait + info */}
          <div className="absolute bottom-0 left-6 lg:left-16 right-6 flex items-end gap-6 pb-8">
            {/* Cover portrait */}
            <div className="hidden lg:block relative w-40 h-52 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <Image
                src={game.cover}
                alt={`Cover de ${game.title}`}
                fill
                className="object-cover object-top"
                sizes="160px"
              />
            </div>

            {/* Title + meta */}
            <div className="flex-1 min-w-0 pb-2">
              {/* Breadcrumb */}
              <nav aria-label="Breadcrumb" className="mb-2">
                <ol className="flex items-center gap-2 text-white/40 text-xs">
                  <li><Link href="/" className="hover:text-white/70">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li className="text-white/60 truncate">{game.title}</li>
                </ol>
              </nav>

              <h1 className="text-white text-3xl lg:text-5xl font-bold leading-tight mb-3 drop-shadow-lg">
                {game.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {game.year && (
                  <span className="text-white/60">{game.year}</span>
                )}

                {game.rating > 0 && (
                  <span
                    className="flex items-center gap-1.5 text-yellow-400"
                    aria-label={`Community rating: ${game.rating.toFixed(1)} out of 5 (${game.ratingCount} votes)`}
                  >
                    <Star size={14} fill="currentColor" />
                    <span className="font-semibold">{game.rating.toFixed(1)}</span>
                    <span className="text-white/40 text-xs">({game.ratingCount.toLocaleString()})</span>
                  </span>
                )}

                {game.metacritic !== null && (
                  <span
                    className={`glass-tag font-bold ${
                      game.metacritic >= 75
                        ? "text-green-400"
                        : game.metacritic >= 50
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                    aria-label={`Metacritic score: ${game.metacritic}`}
                  >
                    MC {game.metacritic}
                  </span>
                )}
              </div>

              {/* Genres */}
              {game.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3" aria-label="Genres">
                  {game.genres.map((g) => (
                    <span key={g.id} className="glass-tag">{g.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="px-6 lg:px-16 py-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: description + screenshots */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {game.description && (
              <section aria-labelledby="desc-heading">
                <h2 id="desc-heading" className="text-white/50 text-xs uppercase tracking-widest mb-3">
                  About
                </h2>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-[10]">
                  {game.description.replace(/<[^>]+>/g, "")}
                </p>
              </section>
            )}

            {/* Screenshots */}
            {game.screenshots.length > 0 && (
              <section aria-labelledby="screenshots-heading">
                <h2 id="screenshots-heading" className="text-white/50 text-xs uppercase tracking-widest mb-3">
                  Screenshots
                </h2>
                <ScreenshotGallery screenshots={game.screenshots} gameTitle={game.title} />
              </section>
            )}

            {/* Trailers */}
            {game.trailers.length > 0 && (
              <section aria-labelledby="trailers-heading">
                <h2 id="trailers-heading" className="text-white/50 text-xs uppercase tracking-widest mb-3">
                  Trailer
                </h2>
                <video
                  src={game.trailers[0].videoHigh || game.trailers[0].videoLow}
                  poster={game.trailers[0].preview}
                  controls
                  className="w-full rounded-lg aspect-video object-cover bg-black"
                  aria-label={game.trailers[0].name}
                />
              </section>
            )}
          </div>

          {/* Right: platforms + stores + tags */}
          <aside className="space-y-6" aria-label="Game details">
            {/* Platforms */}
            {game.platforms.length > 0 && (
              <section aria-labelledby="platforms-heading">
                <h3 id="platforms-heading" className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p) => (
                    <span key={p.id} className="glass-tag">
                      {p.name}
                      {p.releaseYear ? ` (${p.releaseYear})` : ""}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Rating bar */}
            {game.rating > 0 && (
              <section aria-labelledby="rating-heading">
                <h3 id="rating-heading" className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Community Rating
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${ratingPercent}%` }}
                      role="progressbar"
                      aria-valuenow={ratingPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="text-yellow-400 text-sm font-semibold shrink-0">
                    {game.rating.toFixed(1)}/5
                  </span>
                </div>
              </section>
            )}

            {/* Stores */}
            {game.stores.length > 0 && (
              <section aria-labelledby="stores-heading">
                <h3 id="stores-heading" className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Available on
                </h3>
                <div className="flex flex-col gap-2">
                  {game.stores.map((store) => (
                    <a
                      key={store.id}
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-colors text-sm text-white/80 hover:text-white group focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                      aria-label={`Buy on ${store.name} (opens in new tab)`}
                    >
                      <span>{store.name}</span>
                      <ExternalLink size={14} className="text-white/30 group-hover:text-white/70 transition-colors" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {game.tags.length > 0 && (
              <section aria-labelledby="tags-heading">
                <h3 id="tags-heading" className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.tags.map((t) => (
                    <span key={t.id} className="glass-tag" style={{ fontSize: "0.6rem" }}>
                      {t.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </>
  );
}
