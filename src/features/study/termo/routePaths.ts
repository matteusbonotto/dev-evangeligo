export const TERMO_ROUTE_PATHS = {
  lista: "/exercicios/termo",
  jogar: "/exercicios/termo/:id",
} as const;

export function buildTermoPath(id: string): string {
  return `/exercicios/termo/${id}`;
}
