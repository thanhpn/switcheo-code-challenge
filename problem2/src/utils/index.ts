export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatCurrency(
  value: number,
  locale: string = "en-US",
  currency: string = "USD",
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits,
  });

  // Get the currency symbol based on locale and currency
  const parts = formatter.formatToParts(value);
  const currencySymbol = parts.find(part => part.type === 'currency')?.value || '';

  let formattedValue: string;

  if (value >= 1_000_000_000_000) {
    formattedValue = (value / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (value >= 1_000_000_000) {
    formattedValue = (value / 1_000_000_000).toFixed(2) + 'B';
  } else if (value >= 1_000_000) {
    formattedValue = (value / 1_000_000).toFixed(2) + 'M';
  } else {
    // Format as regular currency
    formattedValue = formatter.format(value);
    return formattedValue;
  }

  return currencySymbol + formattedValue;
}
