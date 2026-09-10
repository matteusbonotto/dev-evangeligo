/**
 * Tipos do "Quebra-cabeça" (T-035) — reordenar as palavras de um
 * versículo. Sem equivalente no app legado (só tinha caça-palavras e
 * termo); ver ADR-023 em `IA/memory/decisions.md`.
 */
export interface QuebraCabecaChallenge {
  id: string;
  livroOrder: number;
  capitulo: number;
  versiculo: number;
}

export interface QuebraCabecaSession {
  /** Palavras do versículo, na ordem correta — nunca reordenado. */
  palavrasCorretas: string[];
  /** Índices (para `palavrasCorretas`) ainda não usados, em ordem embaralhada. */
  banco: number[];
  /** Índices já posicionados pelo jogador, na ordem em que foram colocados. */
  montada: number[];
}
