import { beforeEach, describe, expect, it } from "vitest";
import {
  ajustarFonteLeitura,
  FONTE_LEITURA_MAX,
  FONTE_LEITURA_MIN,
  obterFonteLeituraSalva,
  salvarFonteLeitura,
} from "./fonteLeitura";

beforeEach(() => {
  localStorage.clear();
});

describe("ajustarFonteLeitura", () => {
  it("aumenta em passos de 0.15", () => {
    expect(ajustarFonteLeitura(1, 0.15)).toBeCloseTo(1.15);
  });

  it("não passa do máximo (2.0)", () => {
    expect(ajustarFonteLeitura(FONTE_LEITURA_MAX, 0.15)).toBe(FONTE_LEITURA_MAX);
  });

  it("não passa do mínimo (0.7)", () => {
    expect(ajustarFonteLeitura(FONTE_LEITURA_MIN, -0.15)).toBe(FONTE_LEITURA_MIN);
  });
});

describe("obterFonteLeituraSalva / salvarFonteLeitura", () => {
  it("retorna 1 (padrão) quando nada foi salvo", () => {
    expect(obterFonteLeituraSalva()).toBe(1);
  });

  it("persiste e recupera o valor salvo", () => {
    salvarFonteLeitura(1.45);
    expect(obterFonteLeituraSalva()).toBe(1.45);
  });
});
