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
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "INVALID_ID" }, { status: 400 });
  }

  try {
    const [gameResult, screenshotsResult, storesResult, moviesResult] =
      await Promise.allSettled([
        rawgFetch<RAWGGame>(`/games/${id}`),
        rawgFetch<RAWGListResponse<RAWGScreenshot>>(`/games/${id}/screenshots`),
        rawgFetch<RAWGListResponse<RAWGStore>>(`/games/${id}/stores`),
        rawgFetch<RAWGListResponse<RAWGMovie>>(`/games/${id}/movies`),
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
