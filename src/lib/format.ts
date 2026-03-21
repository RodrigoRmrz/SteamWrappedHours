export function formatNumber(value: number) {
  return new Intl.NumberFormat("es-ES").format(value);
}

export function formatHours(value: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
}

export function formatDays(value: number) {
  return new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: value >= 30 ? 0 : 1,
  }).format(value);
}

export function formatMinutesAsHours(minutes: number) {
  return formatHours(minutes / 60);
}
