import { NextRequest, NextResponse } from "next/server";
import { rawgFetch, AppError } from "@/lib/rawgClient";
import { normalizeGameDetail } from "@/lib/normalizer";
import type {
  RAWGGame,
  RAWGListResponse,
  RAWGScreenshot,
  RAWGStore,
  RAWGMovie,
} from "@/types/rawg";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "INVALID_SLUG" }, { status: 400 });
  }

  try {
    const [gameResult, screenshotsResult, storesResult, moviesResult] =
      await Promise.allSettled([
        rawgFetch<RAWGGame>(`/games/${slug}`),
        rawgFetch<RAWGListResponse<RAWGScreenshot>>(`/games/${slug}/screenshots`),
        rawgFetch<RAWGListResponse<RAWGStore>>(`/games/${slug}/stores`),
        rawgFetch<RAWGListResponse<RAWGMovie>>(`/games/${slug}/movies`),
      ]);

    if (gameResult.status === "rejected") {
      const err = gameResult.reason as AppError;
      return NextResponse.json(
        { error: err.code ?? "NOT_FOUND" },
        { status: err.status ?? 404 },
      );
    }

    const game = gameResult.value;
    const screenshots =
      screenshotsResult.status === "fulfilled"
        ? screenshotsResult.value.results
        : [];
    const stores =
      storesResult.status === "fulfilled" ? storesResult.value.results : [];
    const movies =
      moviesResult.status === "fulfilled" ? moviesResult.value.results : [];

    const detail = normalizeGameDetail(game, screenshots, stores, movies);

    return NextResponse.json(detail, {
      headers: {
        "Cache-Control": "s-maxage=1800, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json({ error: "UNKNOWN" }, { status: 500 });
  }
}
