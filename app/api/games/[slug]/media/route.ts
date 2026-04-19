import { NextRequest, NextResponse } from "next/server";
import { rawgFetch, AppError } from "@/lib/rawgClient";
import { normalizeTrailers } from "@/lib/normalizer";
import type { RAWGListResponse, RAWGMovie } from "@/types/rawg";
import type { SoundtrackVM } from "@/types/viewModels";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const movies = await rawgFetch<RAWGListResponse<RAWGMovie>>(`/games/${slug}/movies`)
      .then((r) => r.results)
      .catch(() => []);

    const soundtracks: SoundtrackVM[] = [];

    return NextResponse.json(
      { trailers: normalizeTrailers(movies), soundtracks },
      { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=7200" } },
    );
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json({ trailers: [], soundtracks: [] });
  }
}
