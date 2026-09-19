import { describe, expect, it } from "vitest";
import { quizSchema } from "../../study/quiz/schemas";
import {
  RUTE_QUIZ_CAPITULOS,
  RUTE_QUIZ_LIVRO,
  getQuizCapituloBiblia,
  getQuizLivroBiblia,
} from "./content";

const LIVRO_ORDER_RUTE = 8;

describe("RUTE_QUIZ_CAPITULOS", () => {
  it("tem 1 quiz por capítulo (Rute tem 4 capítulos)", () => {
    expect(Object.keys(RUTE_QUIZ_CAPITULOS)).toHaveLength(4);
  });

  it("cada quiz de capítulo é válido pelo schema (mínimo 5 perguntas, sem aulaId)", () => {
    for (const quiz of Object.values(RUTE_QUIZ_CAPITULOS)) {
      expect(() => quizSchema.parse(quiz)).not.toThrow();
      expect(quiz.questions.length).toBeGreaterThanOrEqual(5);
      expect(quiz.aulaId).toBeUndefined();
    }
  });

  it("cada quiz de capítulo usa ao menos 2 tipos de pergunta diferentes", () => {
    for (const quiz of Object.values(RUTE_QUIZ_CAPITULOS)) {
      const tipos = new Set(quiz.questions.map((q) => q.type));
      expect(tipos.size, quiz.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("ids de pergunta são únicos em todo o conteúdo de Rute (capítulos + livro)", () => {
    const idsCapitulos = Object.values(RUTE_QUIZ_CAPITULOS).flatMap((quiz) =>
      quiz.questions.map((q) => q.id),
    );
    const idsLivro = RUTE_QUIZ_LIVRO.questions.map((q) => q.id);
    const todos = [...idsCapitulos, ...idsLivro];
    expect(new Set(todos).size).toBe(todos.length);
  });
});

describe("RUTE_QUIZ_LIVRO", () => {
  it("é válido pelo schema e tem um conjunto de perguntas PRÓPRIO (não repete os ids dos quizzes de capítulo)", () => {
    expect(() => quizSchema.parse(RUTE_QUIZ_LIVRO)).not.toThrow();
    const idsCapitulos = new Set(
      Object.values(RUTE_QUIZ_CAPITULOS).flatMap((quiz) => quiz.questions.map((q) => q.id)),
    );
    for (const pergunta of RUTE_QUIZ_LIVRO.questions) {
      expect(idsCapitulos.has(pergunta.id), pergunta.id).toBe(false);
    }
  });
});

describe("getQuizCapituloBiblia", () => {
  it("devolve o quiz certo para Rute 1-4", () => {
    for (let capitulo = 1; capitulo <= 4; capitulo++) {
      expect(getQuizCapituloBiblia(LIVRO_ORDER_RUTE, capitulo)?.id).toBe(
        RUTE_QUIZ_CAPITULOS[capitulo].id,
      );
    }
  });

  it("devolve undefined para um livro sem quiz ainda (ex.: Gênesis)", () => {
    expect(getQuizCapituloBiblia(1, 1)).toBeUndefined();
  });

  it("devolve undefined para um capítulo de Rute que não existe (5)", () => {
    expect(getQuizCapituloBiblia(LIVRO_ORDER_RUTE, 5)).toBeUndefined();
  });
});

describe("getQuizLivroBiblia", () => {
  it("devolve o quiz do livro de Rute", () => {
    expect(getQuizLivroBiblia(LIVRO_ORDER_RUTE)?.id).toBe(RUTE_QUIZ_LIVRO.id);
  });

  it("devolve undefined para um livro sem quiz ainda", () => {
    expect(getQuizLivroBiblia(1)).toBeUndefined();
  });
});
