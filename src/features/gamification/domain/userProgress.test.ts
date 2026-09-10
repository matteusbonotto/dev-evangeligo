import { describe, expect, it } from "vitest";
import { getXpProgress } from "./xpCurve";
import {
  applyReward,
  createInitialUserProgress,
  toDashboardView,
  unlockAchievement,
} from "./userProgress";

describe("createInitialUserProgress", () => {
  it("começa com corações cheios e nenhum progresso", () => {
    const state = createInitialUserProgress(5);
    expect(state.totalXp).toBe(0);
    expect(state.gold).toBe(0);
    expect(state.hearts).toBe(5);
    expect(state.maxHearts).toBe(5);
    expect(state.unlockedAchievementIds).toEqual([]);
    expect(state.streak.currentStreak).toBe(0);
  });
});

describe("applyReward", () => {
  it("soma XP e ouro ao estado", () => {
    const state = createInitialUserProgress();
    const updated = applyReward(state, { xp: 50, gold: 20 });
    expect(updated.totalXp).toBe(50);
    expect(updated.gold).toBe(20);
  });

  it("restaura corações sem ultrapassar maxHearts", () => {
    const state = { ...createInitialUserProgress(5), hearts: 3 };
    const updated = applyReward(state, { xp: 0, gold: 0, hearts: 10 });
    expect(updated.hearts).toBe(5);
  });

  it("não altera corações quando a recompensa não inclui hearts", () => {
    const state = { ...createInitialUserProgress(5), hearts: 3 };
    const updated = applyReward(state, { xp: 10, gold: 5 });
    expect(updated.hearts).toBe(3);
  });

  it("é imutável (não modifica o estado original)", () => {
    const state = createInitialUserProgress();
    applyReward(state, { xp: 50, gold: 20 });
    expect(state.totalXp).toBe(0);
    expect(state.gold).toBe(0);
  });

  it("acumula corretamente através de múltiplas recompensas", () => {
    let state = createInitialUserProgress();
    state = applyReward(state, { xp: 30, gold: 10 });
    state = applyReward(state, { xp: 20, gold: 15 });
    expect(state.totalXp).toBe(50);
    expect(state.gold).toBe(25);
  });
});

describe("unlockAchievement", () => {
  it("adiciona um novo ID de conquista", () => {
    const state = createInitialUserProgress();
    const updated = unlockAchievement(state, "primeiro-passo");
    expect(updated.unlockedAchievementIds).toEqual(["primeiro-passo"]);
  });

  it("é idempotente — não duplica IDs já desbloqueados", () => {
    let state = createInitialUserProgress();
    state = unlockAchievement(state, "primeiro-passo");
    state = unlockAchievement(state, "primeiro-passo");
    expect(state.unlockedAchievementIds).toEqual(["primeiro-passo"]);
  });
});

describe("toDashboardView", () => {
  it("projeta o progresso no mesmo formato de campos do HUD (DemoUser)", () => {
    const state = createInitialUserProgress(5);
    const view = toDashboardView(state);
    expect(view).toEqual({
      level: 1,
      xp: 0,
      xpToNextLevel: getXpProgress(0).xpForCurrentLevel,
      gold: 0,
      streakDays: 0,
      bestStreak: 0,
      hearts: 5,
      maxHearts: 5,
    });
  });

  it("reflete XP, ouro, corações e sequência acumulados", () => {
    let state = createInitialUserProgress(5);
    state = applyReward(state, { xp: 150, gold: 40 });
    const view = toDashboardView(state);
    const expectedXpProgress = getXpProgress(150);
    expect(view.level).toBe(expectedXpProgress.level);
    expect(view.xp).toBe(expectedXpProgress.xpIntoLevel);
    expect(view.xpToNextLevel).toBe(expectedXpProgress.xpForCurrentLevel);
    expect(view.gold).toBe(40);
  });
});
