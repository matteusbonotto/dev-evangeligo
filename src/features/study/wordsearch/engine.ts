import { normalizarPalavra } from "../texto";
import type {
  PalavraAlvo,
  ResultadoSelecao,
  WordSearchPuzzle,
  WordSearchSession,
} from "./types";

/**
 * Motor do caça-palavras (T-034) — TypeScript puro, sem dependência de
 * React (`IA/docs/architecture.md`). Geração de grade e seleção por
 * linha migradas de `app.js` (`cacaPalavras`/`linhaCacaPalavras`/
 * `selecionarCelulaCaca`), reescritas como funções puras e testáveis.
 */

const TAMANHO_PADRAO = 10;
const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** As 8 direções em que uma palavra pode ser colocada/lida (linha, coluna, diagonais). */
const DIRECOES: { dr: number; dc: number }[] = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: -1, dc: -1 },
];

function tentarColocarPalavra(
  grade: (string | null)[],
  palavra: string,
  tamanho: number,
  random: () => number,
  tentativasMax = 300,
): boolean {
  for (let tentativa = 0; tentativa < tentativasMax; tentativa++) {
    const dir = DIRECOES[Math.floor(random() * DIRECOES.length)];
    const r0 = Math.floor(random() * tamanho);
    const c0 = Math.floor(random() * tamanho);
    const rFim = r0 + dir.dr * (palavra.length - 1);
    const cFim = c0 + dir.dc * (palavra.length - 1);
    if (rFim < 0 || rFim >= tamanho || cFim < 0 || cFim >= tamanho) continue;

    let cabe = true;
    for (let i = 0; i < palavra.length; i++) {
      const idx = (r0 + dir.dr * i) * tamanho + (c0 + dir.dc * i);
      const existente = grade[idx];
      if (existente && existente !== palavra[i]) {
        cabe = false;
        break;
      }
    }
    if (!cabe) continue;

    for (let i = 0; i < palavra.length; i++) {
      const idx = (r0 + dir.dr * i) * tamanho + (c0 + dir.dc * i);
      grade[idx] = palavra[i];
    }
    return true;
  }
  return false;
}

/** Gera a grade preenchida (palavras colocadas + células restantes com letras aleatórias). */
export function gerarGrade(
  palavras: readonly string[],
  tamanho: number = TAMANHO_PADRAO,
  random: () => number = Math.random,
): string[] {
  const grade: (string | null)[] = Array(tamanho * tamanho).fill(null);
  const normalizadasPorTamanho = [...palavras]
    .map(normalizarPalavra)
    .sort((a, b) => b.length - a.length);

  for (const palavra of normalizadasPorTamanho) {
    tentarColocarPalavra(grade, palavra, tamanho, random);
  }

  for (let i = 0; i < grade.length; i++) {
    if (!grade[i]) {
      grade[i] = LETRAS[Math.floor(random() * LETRAS.length)];
    }
  }
  return grade as string[];
}

export function iniciarWordSearch(
  puzzle: WordSearchPuzzle,
  tamanho: number = TAMANHO_PADRAO,
  random: () => number = Math.random,
): WordSearchSession {
  const palavras: PalavraAlvo[] = puzzle.palavras.map((exibicao) => ({
    exibicao,
    normalizada: normalizarPalavra(exibicao),
  }));
  return {
    puzzle,
    tamanho,
    grade: gerarGrade(puzzle.palavras, tamanho, random),
    palavras,
    encontradas: [],
    celulasEncontradas: [],
    inicio: null,
    concluido: false,
  };
}

/** Células entre `inicio` e `fim` (linha reta: horizontal, vertical ou diagonal); `null` se não alinhados. */
export function celulasDaLinha(
  inicio: number,
  fim: number,
  tamanho: number,
): number[] | null {
  const r1 = Math.floor(inicio / tamanho);
  const c1 = inicio % tamanho;
  const r2 = Math.floor(fim / tamanho);
  const c2 = fim % tamanho;
  const deltaR = r2 - r1;
  const deltaC = c2 - c1;
  const alinhada =
    deltaR === 0 || deltaC === 0 || Math.abs(deltaR) === Math.abs(deltaC);
  if (!alinhada) return null;

  const passos = Math.max(Math.abs(deltaR), Math.abs(deltaC));
  if (passos === 0) return [inicio];
  const dr = Math.sign(deltaR);
  const dc = Math.sign(deltaC);
  return Array.from(
    { length: passos + 1 },
    (_, i) => (r1 + dr * i) * tamanho + (c1 + dc * i),
  );
}

/**
 * Trata um toque numa célula: primeiro toque marca o início; segundo toque
 * avalia a linha formada contra a lista de palavras (aceita a palavra
 * escrita de trás para frente também, como no legado).
 */
export function selecionarCelula(
  session: WordSearchSession,
  index: number,
): { session: WordSearchSession; resultado: ResultadoSelecao } {
  if (session.concluido) {
    return { session, resultado: "puzzle_concluido" };
  }

  if (session.inicio === null) {
    return {
      session: { ...session, inicio: index },
      resultado: "aguardando_fim",
    };
  }

  const celulas = celulasDaLinha(session.inicio, index, session.tamanho);
  if (!celulas) {
    return {
      session: { ...session, inicio: null },
      resultado: "invalida",
    };
  }

  const texto = celulas.map((c) => session.grade[c]).join("");
  const invertido = [...texto].reverse().join("");

  const palavraEncontrada = session.palavras.find(
    (p) =>
      !session.encontradas.includes(p.normalizada) &&
      (p.normalizada === texto || p.normalizada === invertido),
  );

  if (!palavraEncontrada) {
    return {
      session: { ...session, inicio: null },
      resultado: "invalida",
    };
  }

  const encontradas = [...session.encontradas, palavraEncontrada.normalizada];
  const celulasEncontradas = Array.from(
    new Set([...session.celulasEncontradas, ...celulas]),
  );
  const concluido = encontradas.length === session.palavras.length;

  return {
    session: {
      ...session,
      encontradas,
      celulasEncontradas,
      inicio: null,
      concluido,
    },
    resultado: concluido ? "puzzle_concluido" : "palavra_encontrada",
  };
}

/** Todas as palavras do puzzle estão de fato presentes na grade gerada (garantia de solubilidade). */
export function todasPalavrasEstaoNaGrade(session: WordSearchSession): boolean {
  return session.palavras.every((palavra) => {
    for (let inicio = 0; inicio < session.grade.length; inicio++) {
      for (let fim = 0; fim < session.grade.length; fim++) {
        const celulas = celulasDaLinha(inicio, fim, session.tamanho);
        if (!celulas || celulas.length !== palavra.normalizada.length) continue;
        const texto = celulas.map((c) => session.grade[c]).join("");
        if (texto === palavra.normalizada) return true;
      }
    }
    return false;
  });
}
