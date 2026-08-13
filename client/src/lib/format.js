export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE = 'GHS';
export const CURRENCY_LOCALE = 'en-GH';

export function formatPrice(amount) {
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL}${formatted}`;
}