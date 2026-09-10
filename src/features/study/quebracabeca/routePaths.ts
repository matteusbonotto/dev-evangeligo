export const QUEBRA_CABECA_ROUTE_PATHS = {
  lista: "/exercicios/quebra-cabeca",
  jogar: "/exercicios/quebra-cabeca/:id",
} as const;

export function buildQuebraCabecaPath(id: string): string {
  return `/exercicios/quebra-cabeca/${id}`;
}
