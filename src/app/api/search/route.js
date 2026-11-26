import { NextResponse } from "next/server";
import { bagistoList } from "@/lib/bagisto";
import { isLocale } from "@/lib/i18n";

// Feeds the header search suggestions. The storefront key stays on the server.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);
  const lang = searchParams.get("lang");

  if (q.length < 2 || !(await isLocale(lang))) return NextResponse.json({ items: [] });

  try {
    const { items } = await bagistoList(`/products?query=${encodeURIComponent(q)}&per_page=6`, {
      locale: lang,
    });

    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        name: p.name,
        urlKey: p.urlKey,
        image: p.baseImageUrl,
        price: p.price,
        specialPrice: p.specialPrice,
      })),
    });
  } catch (error) {
    console.error("search suggestions failed", error.status ?? "", error.message);
    return NextResponse.json({ items: [] });
  }
}
