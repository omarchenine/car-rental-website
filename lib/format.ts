export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat("de-DE").format(km)} km`
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(n)
}

export function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}
