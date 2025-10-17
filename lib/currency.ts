export type SupportedCurrency = "USD" | "LRD" | "EUR" | "GBP";

export interface ConversionRates {
  usdToLrdRate: number; // LRD per 1 USD
  lrdToUsdRate: number; // USD per 1 LRD
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "USD":
      return "$";
    case "LRD":
      return "L$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return "$";
  }
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates?: Partial<ConversionRates>
): number {
  if (!Number.isFinite(amount)) return 0;
  if (!from || !to || from === to) return amount;
  const usdToLrd = Number(rates?.usdToLrdRate ?? 200);
  const lrdToUsd = Number(rates?.lrdToUsdRate ?? 0.005);

  // Only handle USD <-> LRD; otherwise, return original
  if (from === "USD" && to === "LRD") return amount * usdToLrd;
  if (from === "LRD" && to === "USD") return amount * lrdToUsd;

  return amount; // unsupported pair (EUR/GBP): no conversion
}

export function formatMoney(
  amount: number,
  currency: string,
  locale?: string
): string {
  const symbol = getCurrencySymbol(currency);
  try {
    return `${symbol}${Number(amount).toLocaleString(locale)}`;
  } catch {
    return `${symbol}${Number(amount).toFixed(2)}`;
  }
}
