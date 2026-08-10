/**
 * Central currency formatting for the app.
 * All prices are stored & entered as plain numbers and rendered through
 * `formatPrice` so the symbol, separators, and decimals stay consistent
 * across product listings, cart, checkout, order history, and admin.
 */
export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE   = 'GHS';
export const CURRENCY_LOCALE = 'en-GH';

/** Format a number as GHS currency: "GH₵1,234.50" */
export function formatPrice(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL}${formatted}`;
}
