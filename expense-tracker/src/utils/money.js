const formatterCache = new Map();

export function formatMoney(value, { currency = "PHP", locale = "" } = {}) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0.00";

  const resolvedLocale = locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");
  const key = `${resolvedLocale}:${currency}`;
  if (!formatterCache.has(key)) {
    try {
      formatterCache.set(
        key,
        new Intl.NumberFormat(resolvedLocale, {
          style: "currency",
          currency,
          maximumFractionDigits: 2
        })
      );
    } catch {
      formatterCache.set(
        key,
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "PHP",
          maximumFractionDigits: 2
        })
      );
    }
  }

  return formatterCache.get(key).format(numeric);
}
