import { getXpProgress } from "./xpCurve";
import { createInitialStreakState, type StreakState } from "./streaks";
import type { Reward } from "./types";

/**
 * Estado de progresso do usuário (RF-12/13) — mapeia para a tabela
 * `user_progress` planejada em `IA/docs/database.md`. Compatível em
 * formato com os campos já usados por `DemoUser`
 * (`src/features/authentication/demo/demoUser.ts`) via `toDashboardView`
 * abaixo, para que a UI existente não precise de um modelo paralelo.
 */
export interface UserProgressState {
  /** XP acumulado ao longo de toda a jornada (nunca decresce — nível é derivado disso, ver `xpCurve.ts`). */
  totalXp: number;
  gold: number;
  hearts: number;
  maxHearts: number;
  streak: StreakState;
  unlockedAchievementIds: string[];
}

export function createInitialUserProgress(maxHearts = 5): UserProgressState {
  return {
    totalXp: 0,
    gold: 0,
    hearts: maxHearts,
    maxHearts,
    streak: createInitialStreakState(),
    unlockedAchievementIds: [],
  };
}

/**
 * Aplica uma recompensa (XP/ouro/corações) ao progresso do usuário. Só
 * soma — nunca subtrai (ver `Reward` em `./types` e regra 24: não punir de
 * forma cruel). Corações nunca ultrapassam `maxHearts`.
 *
 * Concessão de itens (`reward.itemIds`) é responsabilidade do inventário
 * do RPG (T-010, que depende desta tarefa) — este módulo não guarda
 * inventário, apenas repassa os IDs para quem chamar integrar com o
 * serviço de inventário.
 */
export function applyReward(
  state: UserProgressState,
  reward: Reward,
): UserProgressState {
  return {
    ...state,
    totalXp: Math.max(0, state.totalXp + reward.xp),
    gold: Math.max(0, state.gold + reward.gold),
    hearts: reward.hearts
      ? Math.min(state.maxHearts, state.hearts + reward.hearts)
      : state.hearts,
  };
}

/** Marca uma conquista como desbloqueada (idempotente — não duplica IDs). */
export function unlockAchievement(
  state: UserProgressState,
  achievementId: string,
): UserProgressState {
  if (state.unlockedAchievementIds.includes(achievementId)) {
    return state;
  }
  return {
    ...state,
    unlockedAchievementIds: [...state.unlockedAchievementIds, achievementId],
  };
}

export interface DashboardProgressView {
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  streakDays: number;
  bestStreak: number;
  hearts: number;
  maxHearts: number;
}

/**
 * Projeta o progresso puro no mesmo formato usado hoje pelo HUD do
 * dashboard (`level`, `xp`, `xpToNextLevel`, `gold`, `streakDays`,
 * `bestStreak`, `hearts`, `maxHearts` — mesmos nomes de campo de
 * `DemoUser`), para que a UI existente possa futuramente trocar o dado
 * mock por este engine sem mudar de forma.
 */
export function toDashboardView(
  state: UserProgressState,
): DashboardProgressView {
  const xpProgress = getXpProgress(state.totalXp);
  return {
    level: xpProgress.level,
    xp: xpProgress.xpIntoLevel,
    xpToNextLevel: xpProgress.xpForCurrentLevel,
    gold: state.gold,
    streakDays: state.streak.currentStreak,
    bestStreak: state.streak.bestStreak,
    hearts: state.hearts,
    maxHearts: state.maxHearts,
  };
}
