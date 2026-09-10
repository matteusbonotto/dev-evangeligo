import { describe, expect, it } from "vitest";
import {
  SHIELD_OF_FAITH_PROTECTION_CHANCE,
  calculateQuizReward,
  getCurrentQuestion,
  isAnswerCorrect,
  startQuizSession,
  submitAnswer,
  summarizeQuizSession,
} from "./engine";
import type { Quiz } from "./schemas";

const bibleRef = {
  book: "Romanos",
  chapter: 3,
  verseStart: 23,
  display: "Romanos 3:23",
};

const quiz: Quiz = {
  id: "quiz-teste",
  aulaId: "aula-teste",
  title: "Quiz de teste",
  questions: [
    {
      id: "q1",
      type: "escolha_unica",
      prompt: "Pergunta 1",
      explanation: "Explicação 1",
      bibleReference: bibleRef,
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
      ],
      correctOptionId: "a",
    },
    {
      id: "q2",
      type: "verdadeiro_falso",
      prompt: "Pergunta 2",
      explanation: "Explicação 2",
      bibleReference: bibleRef,
      correctAnswer: true,
    },
    {
      id: "q3",
      type: "multipla_selecao",
      prompt: "Pergunta 3",
      explanation: "Explicação 3",
      bibleReference: bibleRef,
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
        { id: "c", text: "C" },
      ],
      correctOptionIds: ["a", "c"],
    },
  ],
};

describe("startQuizSession", () => {
  it("inicia com o número de corações padrão e status em_andamento", () => {
    const session = startQuizSession({ quiz });
    expect(session.hearts).toBe(5);
    expect(session.maxHearts).toBe(5);
    expect(session.status).toBe("em_andamento");
    expect(session.currentQuestionIndex).toBe(0);
  });

  it("aceita maxHearts customizado", () => {
    const session = startQuizSession({ quiz, maxHearts: 3 });
    expect(session.hearts).toBe(3);
  });

  it("lança erro para maxHearts <= 0", () => {
    expect(() => startQuizSession({ quiz, maxHearts: 0 })).toThrow();
  });

  it("lança erro para quiz sem perguntas", () => {
    expect(() =>
      startQuizSession({ quiz: { ...quiz, questions: [] } }),
    ).toThrow();
  });
});

describe("isAnswerCorrect", () => {
  it("escolha_unica: correta quando optionId bate", () => {
    expect(
      isAnswerCorrect(quiz.questions[0], {
        type: "escolha_unica",
        optionId: "a",
      }),
    ).toBe(true);
    expect(
      isAnswerCorrect(quiz.questions[0], {
        type: "escolha_unica",
        optionId: "b",
      }),
    ).toBe(false);
  });

  it("verdadeiro_falso: correta quando value bate", () => {
    expect(
      isAnswerCorrect(quiz.questions[1], {
        type: "verdadeiro_falso",
        value: true,
      }),
    ).toBe(true);
    expect(
      isAnswerCorrect(quiz.questions[1], {
        type: "verdadeiro_falso",
        value: false,
      }),
    ).toBe(false);
  });

  it("multipla_selecao: correta apenas com exatamente o mesmo conjunto", () => {
    expect(
      isAnswerCorrect(quiz.questions[2], {
        type: "multipla_selecao",
        optionIds: ["c", "a"],
      }),
    ).toBe(true);
    expect(
      isAnswerCorrect(quiz.questions[2], {
        type: "multipla_selecao",
        optionIds: ["a"],
      }),
    ).toBe(false);
    expect(
      isAnswerCorrect(quiz.questions[2], {
        type: "multipla_selecao",
        optionIds: ["a", "b", "c"],
      }),
    ).toBe(false);
  });

  it("retorna false quando o tipo da resposta não bate com o da pergunta", () => {
    expect(
      isAnswerCorrect(quiz.questions[0], {
        type: "verdadeiro_falso",
        value: true,
      }),
    ).toBe(false);
  });
});

describe("submitAnswer", () => {
  it("acerto não custa coração e avança a pergunta atual", () => {
    const session = startQuizSession({ quiz });
    const next = submitAnswer(session, {
      type: "escolha_unica",
      optionId: "a",
    });
    expect(next.hearts).toBe(5);
    expect(next.currentQuestionIndex).toBe(1);
    expect(next.answered[0]).toMatchObject({
      questionId: "q1",
      correct: true,
      heartLost: false,
    });
    expect(getCurrentQuestion(next)?.id).toBe("q2");
  });

  it("erro sem escudo custa 1 coração", () => {
    const session = startQuizSession({ quiz });
    const next = submitAnswer(session, {
      type: "escolha_unica",
      optionId: "b",
    });
    expect(next.hearts).toBe(4);
    expect(next.answered[0]).toMatchObject({ correct: false, heartLost: true });
  });

  it("erro com escudo da fé e sorteio abaixo do limiar bloqueia a perda do coração", () => {
    const session = startQuizSession({ quiz, hasShieldOfFaith: true });
    const next = submitAnswer(
      session,
      { type: "escolha_unica", optionId: "b" },
      () => 0.1, // < SHIELD_OF_FAITH_PROTECTION_CHANCE (0.2)
    );
    expect(next.hearts).toBe(5);
    expect(next.answered[0]).toMatchObject({
      correct: false,
      heartLost: false,
      shieldBlocked: true,
    });
  });

  it("erro com escudo da fé e sorteio acima do limiar ainda custa o coração", () => {
    const session = startQuizSession({ quiz, hasShieldOfFaith: true });
    const next = submitAnswer(
      session,
      { type: "escolha_unica", optionId: "b" },
      () => 0.9, // >= SHIELD_OF_FAITH_PROTECTION_CHANCE (0.2)
    );
    expect(next.hearts).toBe(4);
    expect(next.answered[0]).toMatchObject({
      correct: false,
      heartLost: true,
      shieldBlocked: false,
    });
  });

  it("chega a concluido depois da última pergunta com corações restantes", () => {
    let session = startQuizSession({ quiz });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "a" });
    session = submitAnswer(session, { type: "verdadeiro_falso", value: true });
    session = submitAnswer(session, {
      type: "multipla_selecao",
      optionIds: ["a", "c"],
    });
    expect(session.status).toBe("concluido");
    expect(session.currentQuestionIndex).toBe(3);
  });

  it("termina em sem_coracoes ao zerar corações antes do fim do quiz", () => {
    let session = startQuizSession({ quiz, maxHearts: 1 });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "b" }); // erra, zera corações
    expect(session.status).toBe("sem_coracoes");
    expect(session.hearts).toBe(0);
  });

  it("lança erro ao tentar responder uma sessão que já terminou", () => {
    let session = startQuizSession({ quiz, maxHearts: 1 });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "b" });
    expect(() =>
      submitAnswer(session, { type: "verdadeiro_falso", value: true }),
    ).toThrow();
  });
});

describe("summarizeQuizSession", () => {
  it("calcula acertos, corações restantes, passed e perfect para um quiz perfeito", () => {
    let session = startQuizSession({ quiz });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "a" });
    session = submitAnswer(session, { type: "verdadeiro_falso", value: true });
    session = submitAnswer(session, {
      type: "multipla_selecao",
      optionIds: ["a", "c"],
    });
    const result = summarizeQuizSession(session);
    expect(result).toEqual({
      totalQuestions: 3,
      correctCount: 3,
      heartsRemaining: 5,
      passed: true,
      perfect: true,
    });
  });

  it("perfect é false quando há pelo menos um erro", () => {
    let session = startQuizSession({ quiz });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "b" }); // erra
    session = submitAnswer(session, { type: "verdadeiro_falso", value: true });
    session = submitAnswer(session, {
      type: "multipla_selecao",
      optionIds: ["a", "c"],
    });
    const result = summarizeQuizSession(session);
    expect(result.correctCount).toBe(2);
    expect(result.perfect).toBe(false);
    expect(result.passed).toBe(true);
  });

  it("passed é false quando a sessão termina sem corações", () => {
    let session = startQuizSession({ quiz, maxHearts: 1 });
    session = submitAnswer(session, { type: "escolha_unica", optionId: "b" });
    const result = summarizeQuizSession(session);
    expect(result.passed).toBe(false);
    expect(result.perfect).toBe(false);
  });
});

describe("calculateQuizReward", () => {
  it("sem recompensa quando não passou", () => {
    expect(
      calculateQuizReward({
        totalQuestions: 3,
        correctCount: 1,
        heartsRemaining: 0,
        passed: false,
        perfect: false,
      }),
    ).toEqual({ xp: 0, gold: 0 });
  });

  it("recompensa proporcional a acertos quando passou sem ser perfeito", () => {
    expect(
      calculateQuizReward({
        totalQuestions: 3,
        correctCount: 2,
        heartsRemaining: 4,
        passed: true,
        perfect: false,
      }),
    ).toEqual({ xp: 20, gold: 10 });
  });

  it("bônus extra quando o quiz é perfeito", () => {
    expect(
      calculateQuizReward({
        totalQuestions: 3,
        correctCount: 3,
        heartsRemaining: 5,
        passed: true,
        perfect: true,
      }),
    ).toEqual({ xp: 50, gold: 30 });
  });
});

describe("SHIELD_OF_FAITH_PROTECTION_CHANCE", () => {
  it("é 20%, conforme RF-11", () => {
    expect(SHIELD_OF_FAITH_PROTECTION_CHANCE).toBe(0.2);
  });
});
