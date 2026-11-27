import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { clearCustomerCookies } from "@/lib/customer";

// The account page sends people here when Bagisto no longer accepts their token (it expired):
// the sign in cookies are removed and the person lands on the sign in page.
export async function GET(request) {
  const requested = new URL(request.url).searchParams.get("lang");
  const lang = (await isLocale(requested)) ? requested : "en";

  clearCustomerCookies(await cookies());
  return NextResponse.redirect(new URL(`/${lang}/login`, request.url));
}
