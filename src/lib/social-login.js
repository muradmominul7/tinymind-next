// Which social sign-in buttons to show. The answer comes from tinymind-headless
// (GET /api/tinymind/social-login), which reads the Bagisto admin settings, so the Google client id and the
// Facebook app id are entered once, in Bagisto (Configuration > Customer > Settings > Social Login).
//
// SOCIAL_LOGIN_PREVIEW=true in .env.local (development only) also draws the buttons of providers that are
// not switched on yet, greyed out, so the design can be looked at before the keys exist.

const BASE_URL = process.env.BAGISTO_URL;

export async function getSocialProviders() {
  let config = null;

  if (BASE_URL) {
    try {
      const res = await fetch(`${BASE_URL}/api/tinymind/social-login`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (res.ok) config = await res.json();
    } catch (error) {
      console.error("getSocialProviders failed", error.message);
    }
  }

  const pick = (provider) => (provider?.enabled && provider.clientId ? { id: provider.clientId } : null);
  const google = pick(config?.google);
  const facebook = pick(config?.facebook);
  const preview = process.env.SOCIAL_LOGIN_PREVIEW === "true" && process.env.NODE_ENV !== "production";

  return {
    google,
    facebook,
    previewGoogle: preview && !google,
    previewFacebook: preview && !facebook,
  };
}
