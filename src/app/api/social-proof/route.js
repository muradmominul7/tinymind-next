import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { getSocialProof } from "@/lib/social-proof";

// Feeds the "someone just bought" pop-up. The browser asks here, never Bagisto directly.
export async function GET(request) {
  const lang = new URL(request.url).searchParams.get("lang");

  if (!(await isLocale(lang))) return NextResponse.json([], { status: 400 });

  return NextResponse.json(await getSocialProof(lang), {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}
