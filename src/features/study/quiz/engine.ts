import type { Quiz, QuizQuestion } from "./schemas";
import type { AnsweredQuestion, QuizAnswer, QuizSessionStatus } from "./types";

/**
 * Motor de quiz (T-008, RF-11) — TypeScript puro, sem dependência de React
 * ou Supabase (`IA/docs/architecture.md`). "Corações/vidas": errar uma
 * pergunta custa 1 coração; ao chegar a 0, a sessão termina em
 * `sem_coracoes` mesmo com perguntas restantes — mesmo conceito de
 * `hearts`/`maxHearts` já usado em `HeartsBar`
 * (`src/features/dashboard/components/HeartsBar.tsx`), mas esta feature
 * não importa nada de `dashboard/` (evita acoplamento entre features) —
 * quem monta a sessão passa `maxHearts` explicitamente.
 *
 * "Escudo da Fé (20% proteção)": o Escudo da Fé é uma das 6 peças da
 * Armadura de Deus (`ARMOR_SLOTS` em
 * `src/features/dashboard/armorSlots.ts`, slot `escudo`). Quando
 * equipado (`hasShieldOfFaith: true` ao iniciar a sessão), cada resposta
 * errada tem `SHIELD_OF_FAITH_PROTECTION_CHANCE` (20%) de chance de não
 * custar um coração — a integração real com o inventário do usuário
 * (ler se o slot `escudo` está equipado) fica para quando esta feature
 * ganhar uma camada de aplicação com dados reais (hoje o dashboard só usa
 * dado mock); por enquanto o chamador decide o valor.
 */
export const SHIELD_OF_FAITH_PROTECTION_CHANCE = 0.2;

const DEFAULT_MAX_HEARTS = 5;

export interface QuizSessionConfig {
  quiz: Quiz;
  maxHearts?: number;
  hasShieldOfFaith?: boolean;
}

export interface QuizSessionState {
  quiz: Quiz;
  currentQuestionIndex: number;
  hearts: number;
  maxHearts: number;
  hasShieldOfFaith: boolean;
  answered: AnsweredQuestion[];
  status: QuizSessionStatus;
}

export interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  heartsRemaining: number;
  /** `false` somente quando a sessão terminou por falta de corações. */
  passed: boolean;
  /** Todas as perguntas corretas de primeira — alimenta a conquista "Acertador"/"Mestre dos Quizzes" (`src/features/gamification/domain/achievements.ts`, `perfectQuizzes`). */
  perfect: boolean;
}

export function startQuizSession(config: QuizSessionConfig): QuizSessionState {
  if (config.quiz.questions.length === 0) {
    throw new Error("Quiz sem perguntas não pode iniciar uma sessão.");
  }
  const maxHearts = config.maxHearts ?? DEFAULT_MAX_HEARTS;
  if (maxHearts <= 0) {
    throw new Error("maxHearts precisa ser maior que zero.");
  }
  return {
    quiz: config.quiz,
    currentQuestionIndex: 0,
    hearts: maxHearts,
    maxHearts,
    hasShieldOfFaith: config.hasShieldOfFaith ?? false,
    answered: [],
    status: "em_andamento",
  };
}

export function getCurrentQuestion(
  session: QuizSessionState,
): QuizQuestion | undefined {
  return session.quiz.questions[session.currentQuestionIndex];
}

/** Compara duas listas de ids ignorando ordem — usada na correção de múltipla seleção. */
function sameOptionSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

export function isAnswerCorrect(
  question: QuizQuestion,
  answer: QuizAnswer,
): boolean {
  if (question.type !== answer.type) {
    return false;
  }
  switch (question.type) {
    case "escolha_unica":
      return (
        answer.type === "escolha_unica" &&
        answer.optionId === question.correctOptionId
      );
    case "verdadeiro_falso":
      return (
        answer.type === "verdadeiro_falso" &&
        answer.value === question.correctAnswer
      );
    case "multipla_selecao":
      return (
        answer.type === "multipla_selecao" &&
        sameOptionSet(answer.optionIds, question.correctOptionIds)
      );
  }
}

/**
 * Responde a pergunta atual e avança a sessão. Pura e determinística: `random`
 * (padrão `Math.random`) é injetável para testes controlarem se o Escudo da
 * Fé bloqueia ou não uma perda de coração.
 */
export function submitAnswer(
  session: QuizSessionState,
  answer: QuizAnswer,
  random: () => number = Math.random,
): QuizSessionState {
  if (session.status !== "em_andamento") {
    throw new Error(
      "Não é possível responder: a sessão de quiz não está em andamento.",
    );
  }
  const question = getCurrentQuestion(session);
  if (!question) {
    throw new Error("Não há pergunta atual para responder.");
  }

  const correct = isAnswerCorrect(question, answer);
  let hearts = session.hearts;
  let heartLost = false;
  let shieldBlocked = false;

  if (!correct) {
    const blockedByShield =
      session.hasShieldOfFaith && random() < SHIELD_OF_FAITH_PROTECTION_CHANCE;
    if (blockedByShield) {
      shieldBlocked = true;
    } else {
      hearts -= 1;
      heartLost = true;
    }
  }

  const answered: AnsweredQuestion[] = [
    ...session.answered,
    { questionId: question.id, correct, heartLost, shieldBlocked },
  ];
  const nextIndex = session.currentQuestionIndex + 1;
  const status: QuizSessionStatus =
    hearts <= 0
      ? "sem_coracoes"
      : nextIndex >= session.quiz.questions.length
        ? "concluido"
        : "em_andamento";

  return {
    ...session,
    hearts,
    answered,
    status,
    currentQuestionIndex: nextIndex,
  };
}

export function summarizeQuizSession(session: QuizSessionState): QuizResult {
  const correctCount = session.answered.filter((a) => a.correct).length;
  const totalQuestions = session.quiz.questions.length;
  return {
    totalQuestions,
    correctCount,
    heartsRemaining: session.hearts,
    passed: session.status !== "sem_coracoes",
    perfect:
      session.status !== "sem_coracoes" &&
      correctCount === session.answered.length &&
      session.answered.length === totalQuestions,
  };
}

export interface QuizReward {
  xp: number;
  gold: number;
}

const XP_PER_CORRECT_ANSWER = 10;
const GOLD_PER_CORRECT_ANSWER = 5;
const PERFECT_QUIZ_XP_BONUS = 20;
const PERFECT_QUIZ_GOLD_BONUS = 15;

/**
 * Recompensa (RF-16) proporcional a acertos, com bônus por quiz perfeito —
 * mesma unidade (`xp`/`gold`) do motor de gamificação
 * (`src/features/gamification/domain/types.ts`, `Reward`), mas calculada
 * aqui sem importar aquele módulo: a integração entre quiz e gamificação
 * (creditar de fato XP/ouro ao progresso do usuário) é trabalho de uma
 * camada de aplicação futura, quando houver persistência real
 * (`user_progress`, ver `IA/docs/database.md`).
 */
export function calculateQuizReward(result: QuizResult): QuizReward {
  if (!result.passed) {
    return { xp: 0, gold: 0 };
  }
  const xp =
    result.correctCount * XP_PER_CORRECT_ANSWER +
    (result.perfect ? PERFECT_QUIZ_XP_BONUS : 0);
  const gold =
    result.correctCount * GOLD_PER_CORRECT_ANSWER +
    (result.perfect ? PERFECT_QUIZ_GOLD_BONUS : 0);
  return { xp, gold };
}
