"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuthTexts } from "@/lib/auth-texts";
import { isLocale } from "@/lib/i18n";
import {
  clearCustomerCookies,
  customerApi,
  firstItem,
  getCustomerToken,
  isEmail,
  normalizePhone,
  pickToken,
  setCustomerCookies,
  tinymindPost,
} from "@/lib/customer";

const REJECTED = [400, 401, 403, 409, 422]; // the API said no (wrong password, email taken, ...)

async function readLang(formData) {
  const lang = String(formData.get("lang") ?? "");
  return (await isLocale(lang)) ? lang : null;
}

// Signs in with an email (or mobile number) and a password. Returns the token, or null when the API refuses.
// Throws for real failures (server down, unexpected answer), so the caller can show a "try again" message.
async function signIn(email, password, lang) {
  try {
    const answer = await customerApi("/customer/login", { method: "POST", body: { email, password }, locale: lang });

    if (answer?.success === false) return null;

    const token = pickToken(answer);
    if (!token) {
      console.error("sign in: the API answer has no token. Fields in the answer:", Object.keys(answer ?? {}));
      throw new Error("no token");
    }
    return token;
  } catch (error) {
    if (REJECTED.includes(error.status)) return null;
    throw error;
  }
}

export async function loginAction(_previous, formData) {
  const lang = await readLang(formData);
  const t = await getAuthTexts(lang ?? "en");
  if (!lang) return { error: t.errors.server };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const keep = { email };

  if (!email || !password) return { ...keep, error: t.errors.required };
  if (!isEmail(email)) return { ...keep, error: t.errors.identifier };

  let token;
  try {
    token = await signIn(email, password, lang);
  } catch (error) {
    console.error("sign in failed", error.status ?? "", error.message, error.detail ?? "");
    return { ...keep, error: t.errors.server };
  }

  if (!token) return { ...keep, error: t.errors.invalidLogin };

  setCustomerCookies(await cookies(), token);
  redirect(`/${lang}/account`);
}

export async function registerAction(_previous, formData) {
  const lang = await readLang(formData);
  const t = await getAuthTexts(lang ?? "en");
  if (!lang) return { error: t.errors.server };

  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const phoneInput = String(formData.get("phone") ?? "");
  const emailInput = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const keep = { name, phone: phoneInput, email: emailInput };

  if (!name) return { ...keep, error: t.errors.name };

  const phone = normalizePhone(phoneInput);
  if (!phone) return { ...keep, error: t.errors.phone };

  if (!isEmail(emailInput)) return { ...keep, error: t.errors.email };
  if (password.length < 6) return { ...keep, error: t.errors.passwordShort };
  if (password !== confirm) return { ...keep, error: t.errors.passwordMismatch };

  const email = emailInput;
  // Bagisto wants a first and a last name; a one-word name gets "-" as last name (it is never shown).
  const [firstName, ...rest] = name.split(" ");
  const lastName = rest.join(" ") || "-";

  try {
    await customerApi("/customers", {
      method: "POST",
      body: { firstName, lastName, email, phone, password, confirmPassword: password },
      locale: lang,
    });
  } catch (error) {
    if (REJECTED.includes(error.status)) {
      console.error("sign up refused", error.status, error.detail ?? "");
      return { ...keep, error: t.errors.registerInvalid };
    }
    console.error("sign up failed", error.status ?? "", error.message, error.detail ?? "");
    return { ...keep, error: t.errors.server };
  }

  // The account exists now: sign in at once. If that does not work, the sign in page says the account is ready.
  let token = null;
  try {
    token = await signIn(email, password, lang);
  } catch (error) {
    console.error("sign in after sign up failed", error.status ?? "", error.message);
  }

  if (!token) redirect(`/${lang}/login?registered=1`);

  setCustomerCookies(await cookies(), token);
  redirect(`/${lang}/account`);
}

export async function logoutAction(lang) {
  const safeLang = (await isLocale(lang)) ? lang : "en";
  const jar = await cookies();
  const token = jar.get("customer_token")?.value;

  if (token) {
    try {
      await customerApi("/customer/logout", { method: "POST", body: {}, token });
    } catch (error) {
      // The cookies are removed in any case.
      console.error("sign out call failed", error.status ?? "", error.message);
    }
  }

  clearCustomerCookies(jar);
  redirect(`/${safeLang}/login`);
}

export async function forgotPasswordAction(_previous, formData) {
  const lang = await readLang(formData);
  const t = await getAuthTexts(lang ?? "en");
  if (!lang) return { error: t.errors.server };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!isEmail(email)) return { email, error: t.errors.emailRequired };

  try {
    await tinymindPost("/forgot-password", { email, lang });
  } catch (error) {
    console.error("forgot password failed", error.status ?? "", error.message);
    return { email, error: t.errors.server };
  }

  // The same answer whether the email exists or not.
  return { email: "", error: null, sent: true };
}

export async function resetPasswordAction(_previous, formData) {
  const lang = await readLang(formData);
  const t = await getAuthTexts(lang ?? "en");
  if (!lang) return { error: t.errors.server };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!isEmail(email) || !token) return { error: t.errors.resetFailed };
  if (password.length < 6) return { error: t.errors.passwordShort };
  if (password !== confirm) return { error: t.errors.passwordMismatch };

  try {
    await tinymindPost("/reset-password", {
      email,
      token,
      password,
      password_confirmation: confirm,
    });
  } catch (error) {
    if (error.status === 422) return { error: t.errors.resetFailed };
    console.error("reset password failed", error.status ?? "", error.message);
    return { error: t.errors.server };
  }

  redirect(`/${lang}/login?reset=1`);
}

// Adds or changes the email of the signed-in customer. The current password is asked for first,
// so someone who only has a signed-in browser cannot take over the account.
export async function changeEmailAction(_previous, formData) {
  const lang = await readLang(formData);
  const t = await getAuthTexts(lang ?? "en");
  if (!lang) return { error: t.errors.server };

  const token = await getCustomerToken();
  if (!token) redirect(`/${lang}/login`);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!isEmail(email)) return { email, error: t.errors.email };
  if (!password) return { email, error: t.errors.required };

  let profile = null;
  let failure = null;
  try {
    profile = firstItem(await customerApi("/customer-profile", { token, locale: lang }));
  } catch (error) {
    failure = error;
  }

  if (failure?.status === 401) redirect(`/api/auth/reset?lang=${lang}`);

  const id = String(profile?.id ?? "").split("/").pop();
  if (failure || !profile || !id) {
    console.error("change email: profile not available", failure?.status ?? "", failure?.message ?? "no id");
    return { email, error: t.errors.server };
  }

  // The current password must be right before anything changes.
  let freshToken;
  try {
    freshToken = await signIn(String(profile.email ?? ""), password, lang);
  } catch (error) {
    console.error("change email: password check failed", error.status ?? "", error.message);
    return { email, error: t.errors.server };
  }
  if (!freshToken) return { email, error: t.errors.invalidPassword };

  // The update replaces the profile, so the other fields are sent as they are now.
  const body = { email };
  for (const key of ["firstName", "lastName", "phone", "gender", "dateOfBirth", "subscribedToNewsLetter"]) {
    if (profile[key] !== undefined && profile[key] !== null) body[key] = profile[key];
  }

  try {
    await customerApi(`/customer-profile-updates/${id}`, { method: "PUT", body, token: freshToken, locale: lang });
  } catch (error) {
    console.error("change email: update failed", error.status ?? "", error.message, error.detail ?? "");
    return { email, error: REJECTED.includes(error.status) ? t.errors.emailTaken : t.errors.server };
  }

  setCustomerCookies(await cookies(), freshToken);
  redirect(`/${lang}/account?email=updated`);
}
