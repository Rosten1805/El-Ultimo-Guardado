import { NextRequest, NextResponse } from "next/server";
import { rawgFetch, AppError } from "@/lib/rawgClient";
import { normalizeGame } from "@/lib/normalizer";
import type { RAWGGame, RAWGListResponse } from "@/types/rawg";
import type { GamesPageVM } from "@/types/viewModels";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const platforms  = searchParams.get("platforms")  ?? undefined;
  const search     = searchParams.get("search")     ?? undefined;
  const ordering   = searchParams.get("ordering")   ?? "-metacritic";
  const page       = searchParams.get("page")       ?? "1";
  const metacritic = searchParams.get("metacritic") ?? undefined;
  const pageSize   = Math.min(Number(searchParams.get("page_size") ?? "40"), 40);

  try {
    const data = await rawgFetch<RAWGListResponse<RAWGGame>>("/games", {
      platforms,
      search,
      ordering,
      page,
      page_size: pageSize,
      exclude_additions: "true",
      ...(metacritic ? { metacritic } : {}),
    });

    // Filter out games without a cover image to avoid broken slides
    const validGames = data.results.filter((g) => !!g.background_image);

    const response: GamesPageVM = {
      games: validGames.map(normalizeGame),
      total: data.count,
      hasNext: !!data.next,
      page: Number(page),
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
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
