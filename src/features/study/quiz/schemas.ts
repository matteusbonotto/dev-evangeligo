import { z } from "zod";
import { bibleReferenceSchema } from "../schemas";

/**
 * Schemas de domínio (Zod) para o motor de quiz (T-008, RF-08/RF-11).
 * Regras puras, sem dependência de React, navegador ou Supabase — ver
 * `IA/docs/architecture.md`. Cada aula pode referenciar um quiz por
 * `aula.quizId` (`../schemas.ts`).
 *
 * Três tipos de pergunta ("diversos tipos", pedido explícito do usuário)
 * para variar a experiência dentro de um mesmo quiz: escolha única,
 * verdadeiro/falso e múltipla seleção. Todas trazem explicação +
 * referência bíblica no feedback, por `IA/docs/ux-ui.md` ("Quiz").
 */

export const quizOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});

const baseQuestionFields = {
  id: z.string().min(1),
  prompt: z.string().min(1),
  /** Exibida no feedback imediato após responder, correto ou não. */
  explanation: z.string().min(1),
  bibleReference: bibleReferenceSchema,
};

export const singleChoiceQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("escolha_unica"),
  options: z.array(quizOptionSchema).min(2),
  correctOptionId: z.string().min(1),
});

export const trueFalseQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("verdadeiro_falso"),
  correctAnswer: z.boolean(),
});

export const multiSelectQuestionSchema = z.object({
  ...baseQuestionFields,
  type: z.literal("multipla_selecao"),
  options: z.array(quizOptionSchema).min(2),
  /** Pelo menos 2 corretas — com só 1 correta, seria uma escolha única disfarçada. */
  correctOptionIds: z.array(z.string().min(1)).min(2),
});

export const quizQuestionSchema = z.discriminatedUnion("type", [
  singleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  multiSelectQuestionSchema,
]);

export const quizSchema = z.object({
  id: z.string().min(1),
  /**
   * Presente só em quizzes de trilha/aula (`study/quiz/content.ts`,
   * `getQuizByAulaId`). Quizzes bíblicos por capítulo/livro (T-045,
   * `bible/quiz/content.ts`) não têm aula associada — motor genérico,
   * sem dependência de `study/`, ver `IA/docs/quiz-biblico-plano.md` seção 4.
   */
  aulaId: z.string().min(1).optional(),
  title: z.string().min(1),
  questions: z.array(quizQuestionSchema).min(3),
});

export type QuizOption = z.infer<typeof quizOptionSchema>;
export type SingleChoiceQuestion = z.infer<typeof singleChoiceQuestionSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseQuestionSchema>;
export type MultiSelectQuestion = z.infer<typeof multiSelectQuestionSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
