import { redirect } from "next/navigation";
import { getDefaultLocale } from "@/lib/i18n";

// "/" goes to the default language of the Bagisto channel (Admin > Settings > Channels).
// This is a route handler, not a page: the only layout of the app lives in [lang], so a page here
// would have no root layout. The answer from Bagisto is reused for about a minute (see lib/i18n.js).
export const dynamic = "force-dynamic";

export async function GET() {
  redirect(`/${await getDefaultLocale()}`);
}