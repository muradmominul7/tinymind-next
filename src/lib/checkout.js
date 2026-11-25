// The Bagisto API refuses an address without a name, a city or a state, but only the phone number is
// really needed (the name, district and address are asked for but never block the order). These values
// fill the gaps; they are what the shop sees on the order, so change them here if you prefer others.
export const FIRST_NAME_FALLBACK = "Customer";
export const LAST_NAME_FALLBACK = "-";
export const ADDRESS_FALLBACK = "-";
export const CITY_FALLBACK = "-";
// The API will not create an order without an email address, but the form does not ask for one.
// The visitor's phone number is used as the mailbox name. Mails sent to it go nowhere, so if you
// ever want order e-mails, add an e-mail field to the form instead.
export const EMAIL_FALLBACK_DOMAIN = "nomail.com";
// A state the delivery rules do not know: the API then gives the default (highest) delivery charge.
export const NO_DISTRICT_STATE = "N/A";

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

// "০১৭১২-৩৪৫ ৬৭৮", "+8801712345678" -> "01712345678"
// While someone is still typing the country prefix ("+", "+8", "88") the result is empty.
export function normalizePhone(value) {
  const s = String(value ?? "")
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[\s\-().]/g, "");
  if (/^\+?8{0,2}$/.test(s)) return "";
  if (s.startsWith("+88")) return s.slice(3);
  if (s.startsWith("880")) return s.slice(2);
  return s;
}

// What is wrong with this phone number, as a key of t.checkout.errors, or null.
// While typing (finished = false) only mistakes that can no longer be fixed by typing more are reported;
// once the visitor leaves the field or submits (finished = true) an incomplete number is reported too.
export function phoneProblem(value, finished = false) {
  const raw = String(value ?? "").trim();
  if (!raw) return finished ? "phoneRequired" : null;

  const s = normalizePhone(raw);
  if (/\D/.test(s)) return "phoneDigits";
  if (!s) return finished ? "phoneInvalid" : null;
  if (s[0] !== "0" || (s.length > 1 && s[1] !== "1")) return "phoneStart";
  if (s.length > 2 && !/[3-9]/.test(s[2])) return "phoneOperator";
  if (s.length > 11) return "phoneTooLong";
  if (s.length < 11) return finished ? "phoneShort" : null;
  return null;
}

export function fallbackEmail(phone) {
  return `${normalizePhone(phone)}@${EMAIL_FALLBACK_DOMAIN}`;
}

// Bangladesh mobile: 01 + operator digit (3-9) + 8 digits
export function isValidPhone(value) {
  return phoneProblem(value, true) === null;
}

// "Md Rahim Uddin" -> first "Md Rahim", last "Uddin"; a single word gets the fallback last name,
// an empty name gets the fallback first name too.
export function splitName(name) {
  const parts = String(name ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean);
  if (parts.length === 0)
    return { first: FIRST_NAME_FALLBACK, last: LAST_NAME_FALLBACK };
  if (parts.length === 1) return { first: parts[0], last: LAST_NAME_FALLBACK };
  const last = parts.pop();
  return { first: parts.join(" "), last };
}

// Only the phone number is required, everything else is optional.
// Returns {} when fine, otherwise { field: "errorKey" } (the keys live in t.checkout.errors).
export function validateCheckout({ phone }) {
  const errors = {};
  const phoneError = phoneProblem(phone, true);
  if (phoneError) errors.phone = phoneError;
  return errors;
}
