import { describe, expect, it } from "vitest";
import { getAulaById } from "../content";
import { quizSchema } from "./schemas";
import { QUIZZES, getQuizByAulaId, getQuizById } from "./content";

describe("QUIZZES", () => {
  it("tem ao menos um quiz por trilha (5 quizzes)", () => {
    expect(QUIZZES.length).toBeGreaterThanOrEqual(5);
  });

  it("cada quiz é válido pelo schema (mínimo 3 perguntas)", () => {
    for (const quiz of QUIZZES) {
      expect(() => quizSchema.parse(quiz)).not.toThrow();
    }
  });

  it("ids de quiz são únicos", () => {
    const ids = QUIZZES.map((quiz) => quiz.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada quiz referencia uma aula que realmente existe", () => {
    for (const quiz of QUIZZES) {
      expect(quiz.aulaId, quiz.id).toBeDefined();
      expect(getAulaById(quiz.aulaId ?? ""), `aula "${quiz.aulaId}"`).toBeDefined();
    }
  });

  it("cada quiz usa ao menos 2 tipos de pergunta diferentes", () => {
    for (const quiz of QUIZZES) {
      const types = new Set(quiz.questions.map((q) => q.type));
      expect(types.size, `quiz "${quiz.id}"`).toBeGreaterThanOrEqual(2);
    }
  });

  it("nenhuma pergunta com correctOptionId fora das opções (escolha_unica)", () => {
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        if (question.type === "escolha_unica") {
          const optionIds = question.options.map((o) => o.id);
          expect(optionIds).toContain(question.correctOptionId);
        }
      }
    }
  });

  it("nenhuma pergunta com correctOptionIds fora das opções (multipla_selecao)", () => {
    for (const quiz of QUIZZES) {
      for (const question of quiz.questions) {
        if (question.type === "multipla_selecao") {
          const optionIds = new Set(question.options.map((o) => o.id));
          for (const correctId of question.correctOptionIds) {
            expect(
              optionIds.has(correctId),
              `"${correctId}" em "${question.id}"`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe("getQuizById / getQuizByAulaId", () => {
  it("getQuizById encontra um quiz existente", () => {
    expect(getQuizById("quiz-solas-1")?.title).toBe("Sola Scriptura");
  });

  it("getQuizById retorna undefined para id inexistente", () => {
    expect(getQuizById("quiz-inexistente")).toBeUndefined();
  });

  it("getQuizByAulaId encontra o quiz pela aula associada", () => {
    expect(getQuizByAulaId("tulip-1")?.id).toBe("quiz-tulip-1");
  });
});
