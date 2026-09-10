import { describe, expect, it } from "vitest";
import { PERGUNTAS_APOLOGETICA } from "./content";
import {
  contarPerguntasPorCategoria,
  contarPerguntasPorDificuldade,
  filtrarPerguntasApologetica,
} from "./filtro";

describe("filtrarPerguntasApologetica", () => {
  it("sem filtro nenhum, retorna todas as perguntas", () => {
    expect(filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {})).toHaveLength(
      PERGUNTAS_APOLOGETICA.length,
    );
  });

  it("filtra por dificuldade (filtro primário, pedido do usuário)", () => {
    const iniciante = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      dificuldade: "iniciante",
    });
    expect(iniciante.length).toBeGreaterThan(0);
    expect(iniciante.every((p) => p.dificuldade === "iniciante")).toBe(true);
  });

  it("filtra por categoria", () => {
    const filtradas = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      categoriaId: "sofrimento-mal",
    });
    expect(filtradas.length).toBeGreaterThan(0);
    expect(filtradas.every((p) => p.categoria === "sofrimento-mal")).toBe(
      true,
    );
  });

  it("filtra por busca de texto (pergunta, resposta ou pontos-chave)", () => {
    const filtradas = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      busca: "ressurrei",
    });
    expect(filtradas.length).toBeGreaterThan(0);
    expect(
      filtradas.every(
        (p) =>
          p.pergunta.toLowerCase().includes("ressurrei") ||
          p.resposta.toLowerCase().includes("ressurrei") ||
          p.pontosChave.some((pc) => pc.toLowerCase().includes("ressurrei")),
      ),
    ).toBe(true);
  });

  it("busca é insensível a maiúsculas/minúsculas", () => {
    const minusculo = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      busca: "deus",
    });
    const maiusculo = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      busca: "DEUS",
    });
    expect(maiusculo).toEqual(minusculo);
  });

  it("combina dificuldade + categoria + busca ao mesmo tempo", () => {
    const filtradas = filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
      dificuldade: "avancado",
      categoriaId: "objecoes-comuns",
      busca: "eleição",
    });
    for (const pergunta of filtradas) {
      expect(pergunta.dificuldade).toBe("avancado");
      expect(pergunta.categoria).toBe("objecoes-comuns");
    }
  });

  it("busca sem nenhuma correspondência retorna lista vazia", () => {
    expect(
      filtrarPerguntasApologetica(PERGUNTAS_APOLOGETICA, {
        busca: "xxxxxnaoexistenaobibliaxxxxx",
      }),
    ).toHaveLength(0);
  });
});

describe("contarPerguntasPorCategoria / contarPerguntasPorDificuldade", () => {
  it("conta perguntas de uma categoria", () => {
    expect(
      contarPerguntasPorCategoria(PERGUNTAS_APOLOGETICA, "jesus-cristo"),
    ).toBe(3);
  });

  it("conta perguntas de uma dificuldade", () => {
    const total = contarPerguntasPorDificuldade(
      PERGUNTAS_APOLOGETICA,
      "avancado",
    );
    expect(total).toBeGreaterThan(0);
    expect(
      total +
        contarPerguntasPorDificuldade(PERGUNTAS_APOLOGETICA, "iniciante") +
        contarPerguntasPorDificuldade(PERGUNTAS_APOLOGETICA, "intermediario"),
    ).toBe(PERGUNTAS_APOLOGETICA.length);
  });
});
