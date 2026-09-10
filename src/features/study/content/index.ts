import type { Aula, Trilha } from "../schemas";
import type { TrilhaComAulas } from "../types";
import { AULAS_OBRAS_FRUTO, TRILHA_OBRAS_FRUTO } from "./obras-fruto";
import { AULAS_PACTOS, TRILHA_PACTOS } from "./pactos";
import { AULAS_SOBERANIA, TRILHA_SOBERANIA } from "./soberania";
import { AULAS_SOLAS, TRILHA_SOLAS } from "./solas";
import { AULAS_TULIP, TRILHA_TULIP } from "./tulip";

/**
 * Agregador do conteúdo estático das 5 trilhas de estudo (T-007,
 * RF-07/RF-08). Ver `IA/docs/content.md` para a distribuição e as fontes
 * doutrinárias, e `IA/memory/decisions.md` ADR-012 para o racional da
 * divisão de 17 aulas entre as trilhas.
 */
export const TRILHAS: Trilha[] = [
  TRILHA_SOLAS,
  TRILHA_TULIP,
  TRILHA_SOBERANIA,
  TRILHA_PACTOS,
  TRILHA_OBRAS_FRUTO,
].sort((a, b) => a.order - b.order);

export const AULAS: Aula[] = [
  ...AULAS_SOLAS,
  ...AULAS_TULIP,
  ...AULAS_SOBERANIA,
  ...AULAS_PACTOS,
  ...AULAS_OBRAS_FRUTO,
];

export function getTrilhaBySlug(slug: string): Trilha | undefined {
  return TRILHAS.find((trilha) => trilha.slug === slug);
}

export function getTrilhaById(id: string): Trilha | undefined {
  return TRILHAS.find((trilha) => trilha.id === id);
}

export function getAulasByTrilha(trilhaId: string): Aula[] {
  return AULAS.filter((aula) => aula.trilhaId === trilhaId).sort(
    (a, b) => a.order - b.order,
  );
}

export function getAulaById(aulaId: string): Aula | undefined {
  return AULAS.find((aula) => aula.id === aulaId);
}

export function getTrilhaComAulas(
  trilhaId: string,
): TrilhaComAulas | undefined {
  const trilha = getTrilhaById(trilhaId);
  if (!trilha) {
    return undefined;
  }
  return { ...trilha, aulas: getAulasByTrilha(trilhaId) };
}
