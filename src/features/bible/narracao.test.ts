import { beforeEach, describe, expect, it } from "vitest";
import {
  ajustarVelocidadeNarracao,
  montarFilaNarracao,
  NARRACAO_VELOCIDADE_MAX,
  NARRACAO_VELOCIDADE_MIN,
  obterVelocidadeNarracaoSalva,
  salvarVelocidadeNarracao,
} from "./narracao";

beforeEach(() => {
  localStorage.clear();
});

describe("montarFilaNarracao", () => {
  it("começa com o preâmbulo livro+capítulo, seguido de um item por versículo numerado", () => {
    const fila = montarFilaNarracao("João", 1, ["No princípio era o Verbo.", "Ele estava com Deus."]);
    expect(fila).toEqual([
      "João capítulo 1.",
      "Versículo 1. No princípio era o Verbo.",
      "Versículo 2. Ele estava com Deus.",
    ]);
  });

  it("retorna só o preâmbulo quando não há versículos", () => {
    expect(montarFilaNarracao("João", 1, [])).toEqual(["João capítulo 1."]);
  });
});

describe("ajustarVelocidadeNarracao", () => {
  it("aumenta dentro do limite (0.25 a 3.0)", () => {
    expect(ajustarVelocidadeNarracao(1, 0.25)).toBeCloseTo(1.25);
  });

  it("não passa do máximo (3.0)", () => {
    expect(ajustarVelocidadeNarracao(NARRACAO_VELOCIDADE_MAX, 0.25)).toBe(NARRACAO_VELOCIDADE_MAX);
  });

  it("não passa do mínimo (0.25)", () => {
    expect(ajustarVelocidadeNarracao(NARRACAO_VELOCIDADE_MIN, -0.25)).toBe(NARRACAO_VELOCIDADE_MIN);
  });
});

describe("obterVelocidadeNarracaoSalva / salvarVelocidadeNarracao", () => {
  it("retorna 1 (padrão) quando nada foi salvo", () => {
    expect(obterVelocidadeNarracaoSalva()).toBe(1);
  });

  it("persiste e recupera o valor salvo", () => {
    salvarVelocidadeNarracao(1.75);
    expect(obterVelocidadeNarracaoSalva()).toBe(1.75);
  });
});
