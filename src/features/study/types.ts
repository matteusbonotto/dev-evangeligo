import type { Aula, Trilha } from "./schemas";

export type { Aula, BibleReference, Trilha } from "./schemas";

/**
 * Trilha com suas aulas já carregadas e ordenadas — conveniência para a UI
 * (evita que cada página tenha que buscar as aulas separadamente).
 */
export interface TrilhaComAulas extends Trilha {
  aulas: Aula[];
}
