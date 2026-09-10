import type { QuebraCabecaChallenge } from "./types";

/**
 * Desafios do quebra-cabeça (T-035) — só a REFERÊNCIA (livro/capítulo/
 * versículo), não o texto em si: o texto é buscado em tempo real de
 * `public/data/biblia-almeida.json` (mesma fonte da Bíblia, `dataLoader.ts`)
 * em vez de duplicar versículos como string literal aqui, respeitando a
 * mesma pendência de validação de licença registrada em ADR-017. Ordenados
 * por número de palavras (crescente), do mais fácil ao mais difícil.
 */
export const QUEBRA_CABECA_CHALLENGES: QuebraCabecaChallenge[] = [
  { id: "qc-filipenses-4-13", livroOrder: 50, capitulo: 4, versiculo: 13 },
  { id: "qc-genesis-1-1", livroOrder: 1, capitulo: 1, versiculo: 1 },
  { id: "qc-salmos-23-1", livroOrder: 19, capitulo: 23, versiculo: 1 },
  { id: "qc-proverbios-3-6", livroOrder: 20, capitulo: 3, versiculo: 6 },
  { id: "qc-salmos-46-1", livroOrder: 19, capitulo: 46, versiculo: 1 },
  { id: "qc-mateus-11-28", livroOrder: 40, capitulo: 11, versiculo: 28 },
  { id: "qc-mateus-6-33", livroOrder: 40, capitulo: 6, versiculo: 33 },
  { id: "qc-joao-14-6", livroOrder: 43, capitulo: 14, versiculo: 6 },
];

export function getQuebraCabecaChallengeById(
  id: string,
): QuebraCabecaChallenge | undefined {
  return QUEBRA_CABECA_CHALLENGES.find((c) => c.id === id);
}
