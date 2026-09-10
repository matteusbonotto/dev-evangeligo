export const WORDSEARCH_ROUTE_PATHS = {
  lista: "/exercicios/caca-palavras",
  jogar: "/exercicios/caca-palavras/:id",
} as const;

export function buildWordSearchPath(id: string): string {
  return `/exercicios/caca-palavras/${id}`;
}
