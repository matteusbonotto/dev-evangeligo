import { describe, expect, it } from "vitest";
import {
  STREAK_FREEZE_MAX_STOCKPILE,
  STREAK_MILESTONES,
  createInitialStreakState,
  earnStreakFreeze,
  getStreakMilestone,
  getStreakRiskStatus,
  recordActivity,
  type StreakState,
} from "./streaks";

function withFreezes(amount: number): StreakState {
  return { ...createInitialStreakState(), freezesAvailable: amount };
}

describe("recordActivity", () => {
  it("inicia a sequência em 1 na primeira atividade", () => {
    const { streak, streakBroken, freezeConsumed } = recordActivity(
      createInitialStreakState(),
      "2026-08-01",
    );
    expect(streak.currentStreak).toBe(1);
    expect(streak.bestStreak).toBe(1);
    expect(streak.lastActiveDate).toBe("2026-08-01");
    expect(streakBroken).toBe(false);
    expect(freezeConsumed).toBe(false);
  });

  it("é idempotente para atividade repetida no mesmo dia", () => {
    const first = recordActivity(createInitialStreakState(), "2026-08-01");
    const second = recordActivity(first.streak, "2026-08-01");
    expect(second.streak).toEqual(first.streak);
    expect(second.streakBroken).toBe(false);
    expect(second.freezeConsumed).toBe(false);
  });

  it("incrementa a sequência em dias consecutivos", () => {
    let result = recordActivity(createInitialStreakState(), "2026-08-01");
    result = recordActivity(result.streak, "2026-08-02");
    result = recordActivity(result.streak, "2026-08-03");
    expect(result.streak.currentStreak).toBe(3);
    expect(result.streak.bestStreak).toBe(3);
    expect(result.streakBroken).toBe(false);
  });

  it("atualiza bestStreak apenas quando currentStreak o supera", () => {
    let result = recordActivity(createInitialStreakState(), "2026-08-01");
    result = recordActivity(result.streak, "2026-08-02"); // streak=2, best=2
    // quebra a sequência (gap de 3 dias, sem freeze)
    result = recordActivity(result.streak, "2026-08-06");
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.bestStreak).toBe(2);
  });

  it("consome um congelamento para perdoar exatamente 1 dia perdido", () => {
    let result = recordActivity(withFreezes(1), "2026-08-01");
    result = recordActivity(result.streak, "2026-08-02"); // streak=2
    // pula 2026-08-03 (falta), retoma em 2026-08-04 -> gap de 2 dias
    result = recordActivity(result.streak, "2026-08-04");
    expect(result.streakBroken).toBe(false);
    expect(result.freezeConsumed).toBe(true);
    expect(result.streak.currentStreak).toBe(3);
    expect(result.streak.freezesAvailable).toBe(0);
    expect(result.streak.freezesUsedTotal).toBe(1);
  });

  it("quebra a sequência em gap de 2 dias sem congelamento disponível", () => {
    let result = recordActivity(createInitialStreakState(), "2026-08-01");
    result = recordActivity(result.streak, "2026-08-02"); // streak=2, best=2
    result = recordActivity(result.streak, "2026-08-04"); // gap de 2 dias, sem freeze
    expect(result.streakBroken).toBe(true);
    expect(result.freezeConsumed).toBe(false);
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.bestStreak).toBe(2);
  });

  it("quebra a sequência em gap de 3+ dias mesmo com congelamento disponível", () => {
    let result = recordActivity(withFreezes(2), "2026-08-01");
    result = recordActivity(result.streak, "2026-08-02"); // streak=2
    result = recordActivity(result.streak, "2026-08-06"); // gap de 4 dias
    expect(result.streakBroken).toBe(true);
    expect(result.freezeConsumed).toBe(false);
    expect(result.streak.currentStreak).toBe(1);
    // congelamento não foi consumido — continua disponível para o próximo gap pequeno.
    expect(result.streak.freezesAvailable).toBe(2);
  });

  it("nunca apaga o recorde (bestStreak) ao quebrar a sequência atual", () => {
    let result = recordActivity(createInitialStreakState(), "2026-01-01");
    for (let day = 2; day <= 10; day += 1) {
      const date = `2026-01-${String(day).padStart(2, "0")}`;
      result = recordActivity(result.streak, date);
    }
    expect(result.streak.bestStreak).toBe(10);
    // quebra grande
    result = recordActivity(result.streak, "2026-02-01");
    expect(result.streak.currentStreak).toBe(1);
    expect(result.streak.bestStreak).toBe(10);
  });

  it("lança erro para data de atividade anterior à última registrada", () => {
    const result = recordActivity(createInitialStreakState(), "2026-08-05");
    expect(() => recordActivity(result.streak, "2026-08-01")).toThrow();
  });

  it("lança erro para formato de data inválido", () => {
    expect(() =>
      recordActivity(createInitialStreakState(), "01/08/2026"),
    ).toThrow();
  });
});

describe("earnStreakFreeze", () => {
  it("adiciona congelamentos ao estoque", () => {
    const streak = earnStreakFreeze(createInitialStreakState());
    expect(streak.freezesAvailable).toBe(1);
  });

  it("nunca ultrapassa o teto STREAK_FREEZE_MAX_STOCKPILE", () => {
    const streak = earnStreakFreeze(
      withFreezes(STREAK_FREEZE_MAX_STOCKPILE),
      5,
    );
    expect(streak.freezesAvailable).toBe(STREAK_FREEZE_MAX_STOCKPILE);
  });
});

describe("getStreakRiskStatus", () => {
  it('retorna "sem_atividade" quando nunca houve atividade', () => {
    expect(getStreakRiskStatus(createInitialStreakState(), "2026-08-01")).toBe(
      "sem_atividade",
    );
  });

  it('retorna "em_dia" quando a última atividade foi hoje', () => {
    const { streak } = recordActivity(createInitialStreakState(), "2026-08-01");
    expect(getStreakRiskStatus(streak, "2026-08-01")).toBe("em_dia");
  });

  it('retorna "em_risco" quando 1 dia se passou sem atividade', () => {
    const { streak } = recordActivity(createInitialStreakState(), "2026-08-01");
    expect(getStreakRiskStatus(streak, "2026-08-02")).toBe("em_risco");
  });

  it('retorna "quebrada" quando 2+ dias se passaram sem atividade', () => {
    const { streak } = recordActivity(createInitialStreakState(), "2026-08-01");
    expect(getStreakRiskStatus(streak, "2026-08-03")).toBe("quebrada");
  });
});

describe("getStreakMilestone", () => {
  it("retorna o marco correspondente exatamente no dia informado", () => {
    expect(getStreakMilestone(7)).toBe(STREAK_MILESTONES[0]);
    expect(getStreakMilestone(30)?.days).toBe(30);
  });

  it("retorna undefined para dias que não são marco", () => {
    expect(getStreakMilestone(8)).toBeUndefined();
    expect(getStreakMilestone(0)).toBeUndefined();
  });

  it("apenas os marcos de 7/30/100 dias concedem congelamento", () => {
    const freezeGrantingDays = STREAK_MILESTONES.filter(
      (m) => m.grantsFreeze,
    ).map((m) => m.days);
    expect(freezeGrantingDays).toEqual([7, 30, 100]);
  });
});
