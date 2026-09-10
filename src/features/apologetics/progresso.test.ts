import { beforeEach, describe, expect, it } from "vitest";
import {
  contarEstudadas,
  marcarPerguntaEstudada,
  obterPerguntasEstudadas,
  perguntaEstudada,
} from "./progresso";

beforeEach(() => {
  localStorage.clear();
});

describe("marcarPerguntaEstudada / perguntaEstudada", () => {
  it("uma pergunta nova não está estudada", () => {
    expect(perguntaEstudada("deus-1")).toBe(false);
  });

  it("marca uma pergunta como estudada", () => {
    marcarPerguntaEstudada("deus-1");
    expect(perguntaEstudada("deus-1")).toBe(true);
  });

  it("marcar a mesma pergunta duas vezes não duplica", () => {
    marcarPerguntaEstudada("deus-1");
    marcarPerguntaEstudada("deus-1");
    expect(obterPerguntasEstudadas()).toEqual(["deus-1"]);
  });

  it("perguntas distintas são rastreadas separadamente", () => {
    marcarPerguntaEstudada("deus-1");
    marcarPerguntaEstudada("jesus-2");
    expect(obterPerguntasEstudadas().sort()).toEqual(["deus-1", "jesus-2"]);
  });
});

describe("contarEstudadas", () => {
  it("conta quantos ids de uma lista já foram estudados", () => {
    marcarPerguntaEstudada("deus-1");
    marcarPerguntaEstudada("deus-2");
    expect(contarEstudadas(["deus-1", "deus-2", "deus-3"])).toBe(2);
  });

  it("retorna 0 sem nenhum progresso salvo", () => {
    expect(contarEstudadas(["deus-1", "deus-2"])).toBe(0);
  });
});
