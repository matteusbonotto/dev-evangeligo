/**
 * Ponto de entrada público da feature de gamificação (RF-12 a RF-16).
 *
 * Tudo exportado aqui é domínio puro (TypeScript, sem React/Supabase) —
 * ver `IA/docs/architecture.md`. Hooks/serviços de aplicação (TanStack
 * Query + Supabase) que consomem este engine ficam fora de
 * `domain/` quando forem implementados (ex.: `hooks/`, `services/`).
 */
export * from "./domain/types";
export * from "./domain/xpCurve";
export * from "./domain/streaks";
export * from "./domain/userProgress";
export * from "./domain/achievements";
export * from "./domain/missions";
