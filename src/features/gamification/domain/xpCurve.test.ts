import { describe, expect, it } from "vitest";
import {
  BASE_LEVEL_XP,
  LEVEL_XP_STEP,
  LEVEL_XP_STEP_CAP_LEVEL,
  calculateLevel,
  getXpProgress,
  totalXpForLevel,
  xpRequiredForLevel,
  xpToNextLevel,
} from "./xpCurve";

describe("xpRequiredForLevel", () => {
  it("retorna o custo base para o nível 1", () => {
    expect(xpRequiredForLevel(1)).toBe(BASE_LEVEL_XP);
  });

  it("cresce linearmente por LEVEL_XP_STEP a cada nível", () => {
    expect(xpRequiredForLevel(2)).toBe(BASE_LEVEL_XP + LEVEL_XP_STEP);
    expect(xpRequiredForLevel(3)).toBe(BASE_LEVEL_XP + LEVEL_XP_STEP * 2);
    expect(xpRequiredForLevel(10)).toBe(BASE_LEVEL_XP + LEVEL_XP_STEP * 9);
  });

  it("estabiliza (plateau) a partir de LEVEL_XP_STEP_CAP_LEVEL", () => {
    const costAtCap = xpRequiredForLevel(LEVEL_XP_STEP_CAP_LEVEL);
    expect(xpRequiredForLevel(LEVEL_XP_STEP_CAP_LEVEL + 1)).toBe(costAtCap);
    expect(xpRequiredForLevel(LEVEL_XP_STEP_CAP_LEVEL + 50)).toBe(costAtCap);
  });

  it("lança erro para nível inválido (zero, negativo ou fracionário)", () => {
    expect(() => xpRequiredForLevel(0)).toThrow();
    expect(() => xpRequiredForLevel(-1)).toThrow();
    expect(() => xpRequiredForLevel(1.5)).toThrow();
  });
});

describe("totalXpForLevel", () => {
  it("é zero para o nível 1 (nenhum XP acumulado até o início da jornada)", () => {
    expect(totalXpForLevel(1)).toBe(0);
  });

  it("acumula a soma dos custos dos níveis anteriores", () => {
    // nível 1 custa 100, nível 2 custa 125 -> alcançar nível 3 exige 225 XP.
    expect(totalXpForLevel(2)).toBe(100);
    expect(totalXpForLevel(3)).toBe(100 + 125);
  });

  it("é estritamente crescente conforme o nível aumenta", () => {
    let previous = totalXpForLevel(1);
    for (let level = 2; level <= 40; level += 1) {
      const current = totalXpForLevel(level);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
  });
});

describe("calculateLevel", () => {
  it("retorna nível 1 para XP zero", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("trata XP negativo como zero (nunca abaixo do nível 1)", () => {
    expect(calculateLevel(-500)).toBe(1);
  });

  it("permanece no nível atual um XP antes do limiar do próximo nível", () => {
    const thresholdForLevel2 = totalXpForLevel(2);
    expect(calculateLevel(thresholdForLevel2 - 1)).toBe(1);
  });

  it("sobe de nível exatamente no limiar acumulado", () => {
    const thresholdForLevel2 = totalXpForLevel(2);
    expect(calculateLevel(thresholdForLevel2)).toBe(2);
  });

  it("calcula corretamente um nível alto além do plateau, sem travar", () => {
    const xp = totalXpForLevel(50) + 1;
    expect(calculateLevel(xp)).toBe(50);
  });

  it("não lança nem trava para XP muito grande", () => {
    expect(() => calculateLevel(5_000_000)).not.toThrow();
    expect(calculateLevel(5_000_000)).toBeGreaterThan(LEVEL_XP_STEP_CAP_LEVEL);
  });
});

describe("getXpProgress", () => {
  it("descreve o progresso completo a partir de zero XP", () => {
    const progress = getXpProgress(0);
    expect(progress).toEqual({
      level: 1,
      totalXp: 0,
      xpIntoLevel: 0,
      xpForCurrentLevel: BASE_LEVEL_XP,
      xpRemainingToNextLevel: BASE_LEVEL_XP,
    });
  });

  it("calcula xpIntoLevel corretamente no meio de um nível", () => {
    const xpForLevelStart = totalXpForLevel(3);
    const progress = getXpProgress(xpForLevelStart + 10);
    expect(progress.level).toBe(3);
    expect(progress.xpIntoLevel).toBe(10);
    expect(progress.xpForCurrentLevel).toBe(xpRequiredForLevel(3));
    expect(progress.xpRemainingToNextLevel).toBe(xpRequiredForLevel(3) - 10);
  });

  it("nunca retorna xpRemainingToNextLevel negativo", () => {
    const progress = getXpProgress(totalXpForLevel(5));
    expect(progress.xpRemainingToNextLevel).toBeGreaterThanOrEqual(0);
  });
});

describe("xpToNextLevel", () => {
  it("é equivalente a xpRemainingToNextLevel de getXpProgress", () => {
    const xp = totalXpForLevel(4) + 30;
    expect(xpToNextLevel(xp)).toBe(getXpProgress(xp).xpRemainingToNextLevel);
  });
});
