export type {
  MultiSelectQuestion,
  Quiz,
  QuizOption,
  QuizQuestion,
  SingleChoiceQuestion,
  TrueFalseQuestion,
} from "./schemas";

/** Resposta que a UI envia para `submitAnswer` — uma por tipo de pergunta. */
export type QuizAnswer =
  | { type: "escolha_unica"; optionId: string }
  | { type: "verdadeiro_falso"; value: boolean }
  | { type: "multipla_selecao"; optionIds: string[] };

export type QuizSessionStatus = "em_andamento" | "concluido" | "sem_coracoes";

export interface AnsweredQuestion {
  questionId: string;
  correct: boolean;
  /** `true` se um coração foi perdido nesta resposta. */
  heartLost: boolean;
  /** `true` se o Escudo da Fé bloqueou a perda do coração nesta resposta. */
  shieldBlocked: boolean;
}
