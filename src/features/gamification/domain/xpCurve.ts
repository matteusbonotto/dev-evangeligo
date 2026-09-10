/**
 * Curva de XP e níveis (RF-12).
 *
 * Racional de balanceamento (ver ADR em `IA/memory/decisions.md`):
 * - O custo do nível 1 é baixo (`BASE_LEVEL_XP` = 100 XP) para que um
 *   usuário novo suba de nível já na primeira sessão — atrito baixo no
 *   início, estilo Duolingo (regra: "balancear para que o jogo seja
 *   acessível a novos usuários").
 * - O custo de cada nível cresce de forma LINEAR (`LEVEL_XP_STEP` = +25 XP
 *   por nível), não exponencial. Crescimento linear no custo por nível
 *   gera uma curva acumulada suave e previsível (quadrática), sem
 *   "explodir" e criar grind punitivo em níveis altos (regra 23: evitar
 *   pressão artificial).
 * - A partir do nível `LEVEL_XP_STEP_CAP_LEVEL` (30) o custo por nível para
 *   de crescer (plateau): todo nível acima de 30 custa o mesmo que o nível
 *   30 (825 XP). Isso garante que um usuário de longa data sempre tenha uma
 *   meta alcançável e conhecida, em vez de enfrentar exigência crescente
 *   para sempre (regras 24/25: não punir de forma cruel; recompensas
 *   reforçam hábito saudável em vez de punir dedicação de longo prazo).
 */

export const BASE_LEVEL_XP = 100;
export const LEVEL_XP_STEP = 25;
export const LEVEL_XP_STEP_CAP_LEVEL = 30;

/**
 * Limite defensivo de iterações para os laços de cálculo de nível — evita
 * loop indefinido caso um valor absurdo de XP seja passado (ex.: Infinity).
 */
const MAX_LEVEL_ITERATIONS = 100_000;

export interface XpProgress {
  level: number;
  totalXp: number;
  /** XP acumulado dentro do nível atual (equivale ao campo `xp` do HUD). */
  xpIntoLevel: number;
  /** XP total exigido para concluir o nível atual (equivale a `xpToNextLevel` do HUD). */
  xpForCurrentLevel: number;
  /** XP que ainda falta para o próximo nível. */
  xpRemainingToNextLevel: number;
}

function assertValidLevel(level: number): void {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`Nível inválido: ${level}. Deve ser um inteiro >= 1.`);
  }
}

/** XP necessário para concluir `level` e avançar para `level + 1`. */
export function xpRequiredForLevel(level: number): number {
  assertValidLevel(level);
  const effectiveLevel = Math.min(level, LEVEL_XP_STEP_CAP_LEVEL);
  return BASE_LEVEL_XP + LEVEL_XP_STEP * (effectiveLevel - 1);
}

/** XP total acumulado (desde o nível 1) necessário para ALCANÇAR `level`. */
export function totalXpForLevel(level: number): number {
  assertValidLevel(level);
  let total = 0;
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += xpRequiredForLevel(currentLevel);
  }
  return total;
}

/**
 * Passagem única (O(nível)) que localiza o nível correspondente a um total
 * de XP e o XP acumulado no início desse nível. Compartilhada por
 * `calculateLevel` e `getXpProgress` para não recalcular o mesmo somatório
 * duas vezes.
 */
function locateLevel(xp: number): { level: number; xpForLevelStart: number } {
  let level = 1;
  let cumulative = 0;
  while (level < MAX_LEVEL_ITERATIONS) {
    const costOfCurrentLevel = xpRequiredForLevel(level);
    if (xp < cumulative + costOfCurrentLevel) {
      break;
    }
    cumulative += costOfCurrentLevel;
    level += 1;
  }
  return { level, xpForLevelStart: cumulative };
}

/** Nível atual dado o XP total acumulado (nunca abaixo de 1). */
export function calculateLevel(totalXp: number): number {
  return locateLevel(Math.max(0, totalXp)).level;
}

/** Quebra completa de progresso de XP/nível a partir do XP total acumulado. */
export function getXpProgress(totalXp: number): XpProgress {
  const xp = Math.max(0, totalXp);
  const { level, xpForLevelStart } = locateLevel(xp);
  const xpForCurrentLevel = xpRequiredForLevel(level);
  const xpIntoLevel = xp - xpForLevelStart;
  return {
    level,
    totalXp: xp,
    xpIntoLevel,
    xpForCurrentLevel,
    xpRemainingToNextLevel: Math.max(0, xpForCurrentLevel - xpIntoLevel),
  };
}

/** Atalho: XP restante para o próximo nível. */
export function xpToNextLevel(totalXp: number): number {
  return getXpProgress(totalXp).xpRemainingToNextLevel;
}
