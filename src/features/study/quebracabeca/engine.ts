import { embaralharLista } from "../texto";
import type { QuebraCabecaSession } from "./types";

/**
 * Motor do quebra-cabeça (T-035) — TypeScript puro, sem dependência de
 * React. Reordenar as palavras de um versículo, ao estilo "monte a frase"
 * do Duolingo: tocar numa palavra do banco embaralhado a acrescenta ao
 * fim da frase montada; tocar numa palavra já montada a devolve ao banco
 * (as demais deslizam, sem buracos no meio da frase).
 */

/** Divide um texto em palavras por espaço em branco (mantém pontuação grudada na palavra). */
export function dividirEmPalavras(texto: string): string[] {
  return texto.trim().split(/\s+/);
}

export function iniciarQuebraCabeca(
  texto: string,
  random: () => number = Math.random,
): QuebraCabecaSession {
  const palavrasCorretas = dividirEmPalavras(texto);
  const indices = palavrasCorretas.map((_, i) => i);
  return {
    palavrasCorretas,
    banco: embaralharLista(indices, random),
    montada: [],
  };
}

/** Move a palavra na posição `indiceNoBanco` do banco para o fim da frase montada. */
export function posicionarPalavra(
  session: QuebraCabecaSession,
  indiceNoBanco: number,
): QuebraCabecaSession {
  if (indiceNoBanco < 0 || indiceNoBanco >= session.banco.length) return session;
  const valor = session.banco[indiceNoBanco];
  const banco = session.banco.filter((_, i) => i !== indiceNoBanco);
  return { ...session, banco, montada: [...session.montada, valor] };
}

/** Remove a palavra na posição `indiceNaMontada` da frase montada e a devolve ao fim do banco. */
export function removerDaMontada(
  session: QuebraCabecaSession,
  indiceNaMontada: number,
): QuebraCabecaSession {
  if (indiceNaMontada < 0 || indiceNaMontada >= session.montada.length) {
    return session;
  }
  const valor = session.montada[indiceNaMontada];
  const montada = session.montada.filter((_, i) => i !== indiceNaMontada);
  return { ...session, banco: [...session.banco, valor], montada };
}

export function estaCompleto(session: QuebraCabecaSession): boolean {
  return session.montada.length === session.palavrasCorretas.length;
}

/**
 * Compara o TEXTO resultante da ordem montada com a ordem original —
 * não os índices — para que duas instâncias de uma mesma palavra
 * repetida no versículo (ex.: "e") possam ser trocadas entre si sem
 * marcar erro: o que importa é a frase final, não qual cópia específica
 * de uma palavra duplicada foi usada em cada posição.
 */
export function estaCorreto(session: QuebraCabecaSession): boolean {
  if (!estaCompleto(session)) return false;
  return session.montada.every(
    (indice, posicao) =>
      session.palavrasCorretas[indice] === session.palavrasCorretas[posicao],
  );
}

export function sentencaMontada(session: QuebraCabecaSession): string {
  return session.montada.map((i) => session.palavrasCorretas[i]).join(" ");
}
