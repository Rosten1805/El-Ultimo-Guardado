import { NextResponse } from "next/server";
import { rawgFetch, AppError } from "@/lib/rawgClient";
import { normalizePlatform } from "@/lib/normalizer";
import type { RAWGListResponse, RAWGPlatform } from "@/types/rawg";

export async function GET() {
  try {
    const data = await rawgFetch<RAWGListResponse<RAWGPlatform>>("/platforms", {
      ordering: "-games_count",
      page_size: 20,
    });

    const platforms = data.results.map(normalizePlatform);

    return NextResponse.json(platforms, {
      headers: {
        "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800",
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
