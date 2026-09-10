import type { DificuldadeApologetica, PerguntaApologetica } from "./schemas";

/**
 * Filtragem pura da lista de perguntas da Apologética (regra 7: regras de
 * domínio não dependem de React/navegador). Porta `perguntasFiltradas()` de
 * `app.js` do legado, com um filtro a mais: dificuldade — pedido explícito
 * do usuário ("lista estilo perguntas frequentes por NÍVEL DE DIFICULDADE"
 * é o filtro primário desta tela; categoria é secundário/bônus, igual ao
 * legado).
 */

/** `null` representa "todas as dificuldades" — sem seleção nenhuma. */
export type FiltroDificuldade = DificuldadeApologetica | null;

export interface FiltroApologetica {
  dificuldade?: FiltroDificuldade;
  categoriaId?: string | null;
  busca?: string;
}

export const DIFICULDADES_APOLOGETICA: DificuldadeApologetica[] = [
  "iniciante",
  "intermediario",
  "avancado",
];

export const DIFICULDADE_LABEL: Record<DificuldadeApologetica, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function filtrarPerguntasApologetica(
  perguntas: readonly PerguntaApologetica[],
  filtro: FiltroApologetica,
): PerguntaApologetica[] {
  let filtradas = [...perguntas];

  if (filtro.dificuldade) {
    filtradas = filtradas.filter((p) => p.dificuldade === filtro.dificuldade);
  }

  if (filtro.categoriaId) {
    filtradas = filtradas.filter((p) => p.categoria === filtro.categoriaId);
  }

  const busca = filtro.busca?.trim().toLowerCase();
  if (busca) {
    filtradas = filtradas.filter(
      (p) =>
        p.pergunta.toLowerCase().includes(busca) ||
        p.resposta.toLowerCase().includes(busca) ||
        p.pontosChave.some((ponto) => ponto.toLowerCase().includes(busca)),
    );
  }

  return filtradas;
}

/** Quantas perguntas existem numa categoria (para o contador do chip). */
export function contarPerguntasPorCategoria(
  perguntas: readonly PerguntaApologetica[],
  categoriaId: string,
): number {
  return perguntas.filter((p) => p.categoria === categoriaId).length;
}

/** Quantas perguntas existem num nível de dificuldade (para o contador do chip). */
export function contarPerguntasPorDificuldade(
  perguntas: readonly PerguntaApologetica[],
  dificuldade: DificuldadeApologetica,
): number {
  return perguntas.filter((p) => p.dificuldade === dificuldade).length;
}
