export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
