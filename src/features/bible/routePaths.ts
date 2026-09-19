/**
 * Rotas sugeridas desta feature. Registradas em `src/app/routePaths.ts` e
 * `src/app/AppRouter.tsx` diretamente por esta mesma sessão (sem restrição
 * de agentes concorrentes desta vez).
 */
export const BIBLE_ROUTE_PATHS = {
  livros: "/biblia",
  capitulos: "/biblia/:livroCodigo",
  leitura: "/biblia/:livroCodigo/:capitulo",
  quizCapitulo: "/biblia/:livroCodigo/:capitulo/quiz",
  quizLivro: "/biblia/:livroCodigo/quiz",
} as const;

export function buildCapitulosPath(livroCodigo: string): string {
  return `/biblia/${livroCodigo.toLowerCase()}`;
}

/**
 * `versiculo` (opcional) pede à `LeituraPage` para rolar até e destacar
 * temporariamente aquele versículo depois de carregar o capítulo — usado
 * pela busca por versículo em `LivrosPage` (T-038/ADR-033).
 */
export function buildLeituraPath(
  livroCodigo: string,
  capitulo: number,
  versiculo?: number,
): string {
  const base = `/biblia/${livroCodigo.toLowerCase()}/${capitulo}`;
  return versiculo ? `${base}?v=${versiculo}` : base;
}

export function buildQuizCapituloPath(livroCodigo: string, capitulo: number): string {
  return `/biblia/${livroCodigo.toLowerCase()}/${capitulo}/quiz`;
}

export function buildQuizLivroPath(livroCodigo: string): string {
  return `/biblia/${livroCodigo.toLowerCase()}/quiz`;
}
