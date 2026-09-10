/**
 * Rotas sugeridas desta feature. Registradas em `src/app/routePaths.ts` e
 * `src/app/AppRouter.tsx` diretamente por esta mesma sessão (sem restrição
 * de agentes concorrentes desta vez).
 */
export const BIBLE_ROUTE_PATHS = {
  livros: "/biblia",
  capitulos: "/biblia/:livroCodigo",
  leitura: "/biblia/:livroCodigo/:capitulo",
} as const;

export function buildCapitulosPath(livroCodigo: string): string {
  return `/biblia/${livroCodigo.toLowerCase()}`;
}

export function buildLeituraPath(
  livroCodigo: string,
  capitulo: number,
): string {
  return `/biblia/${livroCodigo.toLowerCase()}/${capitulo}`;
}
