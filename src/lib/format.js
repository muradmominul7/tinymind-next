// Prices come from the API as plain numbers; we format them per language here.
export function formatMoney(value, locale) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";

  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
    style: "currency",
    currency: "BDT",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(n);
}
