export const HARPA_ROUTE_PATHS = {
  hinos: "/harpa",
  hino: "/harpa/:numero",
} as const;

export function buildHinoPath(numero: number): string {
  return `/harpa/${numero}`;
}
