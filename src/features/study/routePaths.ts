/**
 * Rotas sugeridas para esta feature. Ainda NÃO registradas em
 * `src/app/routePaths.ts` nem em `src/app/AppRouter.tsx` — por restrição
 * de escopo da tarefa T-007 (evitar conflito com outros agentes mexendo
 * no roteamento em paralelo), a integração fica para depois. Ver relatório
 * do Content Specialist / `IA/memory/project-memory.md` para os detalhes.
 */
export const STUDY_ROUTE_PATHS = {
  trilhas: "/trilhas",
  aula: "/trilhas/:trilhaSlug/aulas/:aulaId",
  quiz: "/trilhas/:trilhaSlug/aulas/:aulaId/quiz",
} as const;

export function buildTrilhaPath(trilhaSlug: string): string {
  return `/trilhas/${trilhaSlug}`;
}

export function buildAulaPath(trilhaSlug: string, aulaId: string): string {
  return `/trilhas/${trilhaSlug}/aulas/${aulaId}`;
}

export function buildQuizPath(trilhaSlug: string, aulaId: string): string {
  return `/trilhas/${trilhaSlug}/aulas/${aulaId}/quiz`;
}
