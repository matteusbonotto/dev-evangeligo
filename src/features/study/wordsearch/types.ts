/**
 * Tipos do caça-palavras (T-034), migrado de
 * `dev-pwa-biblia-game/public/game/assets/js/dados/desafiosBiblicos.js`
 * (`DESAFIOS_BIBLICOS.caca_palavras`) e da lógica de grade/seleção de
 * `app.js` (`cacaPalavras`/`linhaCacaPalavras`/`selecionarCelulaCaca`).
 */

/** Um desafio de caça-palavras, antes de gerar a grade. */
export interface WordSearchPuzzle {
  id: string;
  titulo: string;
  /** Palavras a encontrar, texto de exibição (com acentos). */
  palavras: string[];
  referencia: string;
  dica: string;
}

/** Uma palavra já normalizada (sem acento, maiúscula) junto com seu texto de exibição original. */
export interface PalavraAlvo {
  normalizada: string;
  exibicao: string;
}

export interface WordSearchSession {
  puzzle: WordSearchPuzzle;
  tamanho: number;
  grade: string[];
  palavras: PalavraAlvo[];
  encontradas: string[];
  celulasEncontradas: number[];
  inicio: number | null;
  concluido: boolean;
}

export type ResultadoSelecao =
  | "aguardando_fim"
  | "palavra_encontrada"
  | "ja_encontrada"
  | "invalida"
  | "puzzle_concluido";
