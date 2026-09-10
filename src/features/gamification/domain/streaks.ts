import type { Reward } from "./types";

/**
 * Motor de sequências diárias / streaks (RF-13).
 *
 * Racional de balanceamento (ver ADR em `IA/memory/decisions.md`):
 * - A sequência quebra ao faltar 2 ou mais dias consecutivos sem
 *   "congelamento" disponível — é o que dá significado ao hábito diário
 *   (sem isso, a sequência vira só um contador decorativo).
 * - "Congelamento de sequência" (streak freeze) perdoa EXATAMENTE 1 dia
 *   perdido, consumindo 1 unidade do estoque do jogador. É só GANHÁVEL por
 *   marcos de consistência (`STREAK_MILESTONES`), NUNCA comprável com ouro
 *   ou dinheiro — decisão deliberada para não abrir uma mecânica de "pagar
 *   para não perder o progresso" (regra 23: evitar mecânicas
 *   viciantes/pressão artificial de compra). O estoque tem teto
 *   (`STREAK_FREEZE_MAX_STOCKPILE`) para não virar uma rede de segurança
 *   infinita que esvazia o propósito do hábito diário.
 * - Ao quebrar, a sequência atual volta para 1 (o dia de retorno já conta
 *   como novo início), nunca para 0 — evita a sensação de "perdi tudo, não
 *   vale mais a pena voltar" (regra 24: não punir de forma cruel). O
 *   recorde (`bestStreak`) NUNCA é apagado ao quebrar a sequência atual: o
 *   usuário nunca perde uma conquista histórica por ter faltado um dia.
 */

export const STREAK_FREEZE_MAX_STOCKPILE = 2;

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  /** Data (YYYY-MM-DD) da última atividade contabilizada, ou `null` se nunca houve atividade. */
  lastActiveDate: string | null;
  freezesAvailable: number;
  freezesUsedTotal: number;
}

export function createInitialStreakState(): StreakState {
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: null,
    freezesAvailable: 0,
    freezesUsedTotal: 0,
  };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertValidDate(date: string, label: string): void {
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`${label} inválida: "${date}". Use o formato YYYY-MM-DD.`);
  }
}

/** Diferença em dias entre duas datas YYYY-MM-DD, calculada em UTC para não depender de fuso horário local. */
function daysBetween(from: string, to: string): number {
  assertValidDate(from, "Data inicial");
  assertValidDate(to, "Data final");
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toUtc - fromUtc) / 86_400_000);
}

export interface RecordActivityResult {
  streak: StreakState;
  /** `true` se esta atividade quebrou uma sequência anterior (>=2 dias sem atividade e sem congelamento cobrindo o intervalo). */
  streakBroken: boolean;
  /** `true` se um congelamento foi consumido para proteger a sequência. */
  freezeConsumed: boolean;
}

/**
 * Registra atividade do usuário em `activityDate` (YYYY-MM-DD). Função
 * pura: não lê o relógio do sistema — quem chama decide "hoje", o que
 * mantém a função testável e livre de fuso horário implícito.
 *
 * Regras:
 * - Mesma data da última atividade → nenhuma mudança (idempotente).
 * - 1 dia após a última atividade → sequência incrementa normalmente.
 * - 2 dias após a última atividade E há congelamento disponível → o
 *   congelamento é consumido e a sequência incrementa sem quebrar.
 * - 2+ dias sem congelamento disponível, ou 3+ dias mesmo com congelamento
 *   disponível (o congelamento só cobre 1 dia perdido) → a sequência
 *   quebra e reinicia em 1; `bestStreak` é preservado.
 */
export function recordActivity(
  streak: StreakState,
  activityDate: string,
): RecordActivityResult {
  assertValidDate(activityDate, "Data de atividade");

  if (streak.lastActiveDate === null) {
    return {
      streak: {
        ...streak,
        currentStreak: 1,
        bestStreak: Math.max(streak.bestStreak, 1),
        lastActiveDate: activityDate,
      },
      streakBroken: false,
      freezeConsumed: false,
    };
  }

  const diff = daysBetween(streak.lastActiveDate, activityDate);

  if (diff < 0) {
    throw new Error(
      "Data de atividade não pode ser anterior à última atividade registrada.",
    );
  }

  if (diff === 0) {
    return { streak, streakBroken: false, freezeConsumed: false };
  }

  if (diff === 1) {
    const currentStreak = streak.currentStreak + 1;
    return {
      streak: {
        ...streak,
        currentStreak,
        bestStreak: Math.max(streak.bestStreak, currentStreak),
        lastActiveDate: activityDate,
      },
      streakBroken: false,
      freezeConsumed: false,
    };
  }

  if (diff === 2 && streak.freezesAvailable > 0) {
    const currentStreak = streak.currentStreak + 1;
    return {
      streak: {
        ...streak,
        currentStreak,
        bestStreak: Math.max(streak.bestStreak, currentStreak),
        lastActiveDate: activityDate,
        freezesAvailable: streak.freezesAvailable - 1,
        freezesUsedTotal: streak.freezesUsedTotal + 1,
      },
      streakBroken: false,
      freezeConsumed: true,
    };
  }

  return {
    streak: {
      ...streak,
      currentStreak: 1,
      lastActiveDate: activityDate,
      // bestStreak preservado deliberadamente — ver regra 24 no cabeçalho.
    },
    streakBroken: true,
    freezeConsumed: false,
  };
}

/**
 * Concede congelamentos de sequência (ganháveis via `STREAK_MILESTONES`,
 * nunca compráveis — ver racional no cabeçalho). Respeita o teto de
 * estoque `STREAK_FREEZE_MAX_STOCKPILE`.
 */
export function earnStreakFreeze(streak: StreakState, amount = 1): StreakState {
  return {
    ...streak,
    freezesAvailable: Math.min(
      streak.freezesAvailable + amount,
      STREAK_FREEZE_MAX_STOCKPILE,
    ),
  };
}

export type StreakRiskStatus =
  "sem_atividade" | "em_dia" | "em_risco" | "quebrada";

/**
 * Status somente-leitura para lembrete de UI (ex.: "sua sequência está em
 * risco!"). Não muta o estado.
 */
export function getStreakRiskStatus(
  streak: StreakState,
  today: string,
): StreakRiskStatus {
  if (streak.lastActiveDate === null) {
    return "sem_atividade";
  }
  const diff = daysBetween(streak.lastActiveDate, today);
  if (diff <= 0) return "em_dia";
  if (diff === 1) return "em_risco";
  return "quebrada";
}

export interface StreakMilestone {
  days: number;
  reward: Reward;
  /** Se este marco reabastece o estoque de congelamentos. */
  grantsFreeze: boolean;
}

/**
 * Marcos de sequência com recompensa crescente porém LIMITADA (não
 * exponencial) — reforça o hábito sem criar a pressão de "não posso parar
 * nunca" (regra 23). Apenas os marcos de 7/30/100 dias concedem
 * congelamento: são os únicos pontos em que o jogador reabastece o estoque
 * de proteção da sequência.
 */
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 7, reward: { xp: 50, gold: 30 }, grantsFreeze: true },
  { days: 14, reward: { xp: 80, gold: 50 }, grantsFreeze: false },
  { days: 30, reward: { xp: 150, gold: 100 }, grantsFreeze: true },
  { days: 60, reward: { xp: 200, gold: 150 }, grantsFreeze: false },
  { days: 100, reward: { xp: 300, gold: 250 }, grantsFreeze: true },
  { days: 365, reward: { xp: 1000, gold: 800 }, grantsFreeze: false },
];

/** Retorna o marco atingido EXATAMENTE em `streakLength`, se houver (evita conceder o mesmo marco mais de uma vez). */
export function getStreakMilestone(
  streakLength: number,
): StreakMilestone | undefined {
  return STREAK_MILESTONES.find((milestone) => milestone.days === streakLength);
}
