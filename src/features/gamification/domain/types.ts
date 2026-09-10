/**
 * Tipos compartilhados do domínio de gamificação (RF-12 a RF-16).
 *
 * Camada de domínio: TypeScript puro, sem dependência de React, navegador
 * ou Supabase (ver `IA/docs/architecture.md` e `IA/memory/rules.md`,
 * regra 7). Todo o resto de `src/features/gamification/domain/` depende
 * apenas deste arquivo e uns dos outros — nunca de código de apresentação.
 */

/**
 * Raridade de conquistas e itens (comum/raro/épico/lendário).
 *
 * Os valores são intencionalmente os mesmos de `Rarity` em
 * `src/features/authentication/demo/demoUser.ts`, mas o tipo é duplicado
 * aqui em vez de importado de lá: o domínio de gamificação não deve
 * depender de um arquivo de dado mock de outra feature (camada de domínio
 * não aponta para apresentação). Os dados continuam estruturalmente
 * compatíveis porque os literais são idênticos.
 */
export type Rarity = "comum" | "raro" | "epico" | "lendario";

/**
 * Os 6 tipos de missão herdados do legado (ver `IA/agents/gamificacao.md`
 * e RF-15).
 */
export type MissionType =
  | "humana"
  | "espiritual"
  | "conhecimento"
  | "tarefa"
  | "casal"
  | "colaborativa";

/**
 * Recompensa concedida por conquistas, missões ou marcos de sequência
 * (RF-16). `xp`/`gold`/`hearts` são sempre valores a SOMAR ao progresso do
 * usuário — este módulo nunca modela perda/penalidade de XP, ouro ou
 * corações (ver `IA/memory/rules.md`, regra 24: "não punir de forma
 * cruel"). Perda de corações em quiz é responsabilidade da feature de quiz
 * (T-008), não deste módulo.
 */
export interface Reward {
  xp: number;
  gold: number;
  /** Corações restaurados por esta recompensa (opcional, nunca negativo). */
  hearts?: number;
  /** IDs de itens do catálogo RPG (T-010) concedidos por esta recompensa. */
  itemIds?: string[];
}
