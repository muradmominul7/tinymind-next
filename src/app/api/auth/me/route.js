import { NextResponse } from "next/server";
import { customerApi, firstItem, getCustomerToken } from "@/lib/customer";

// The name shown in the profile menu of the header ("Welcome, <name>"). Read when the menu is opened.
// The token stays in its httpOnly cookie; only the name leaves the server.
export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  const token = await getCustomerToken();

  if (!token) return NextResponse.json({ name: null }, { headers });

  try {
    const profile = firstItem(await customerApi("/customer-profile", { token }));
    const name = [profile?.firstName ?? profile?.first_name, profile?.lastName ?? profile?.last_name]
      .filter((part) => part && part !== "-")
      .join(" ");

    return NextResponse.json({ name: name || null }, { headers });
  } catch (error) {
    // 401: Bagisto no longer accepts the token (it expired).
    return NextResponse.json({ name: null, expired: error.status === 401 }, { headers });
  }
}
