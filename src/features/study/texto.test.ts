import { describe, expect, it } from "vitest";
import { embaralharLista, normalizarPalavra } from "./texto";

describe("normalizarPalavra", () => {
  it("remove acentos e deixa maiúsculo", () => {
    expect(normalizarPalavra("Graça")).toBe("GRACA");
    expect(normalizarPalavra("Espírito")).toBe("ESPIRITO");
    expect(normalizarPalavra("Salvação")).toBe("SALVACAO");
  });

  it("remove espaços e pontuação", () => {
    expect(normalizarPalavra("bom samaritano!")).toBe("BOMSAMARITANO");
  });

  it("string vazia por padrão", () => {
    expect(normalizarPalavra()).toBe("");
  });
});

describe("embaralharLista", () => {
  it("mantém os mesmos elementos, só reordenados", () => {
    const original = [1, 2, 3, 4, 5];
    const embaralhada = embaralharLista(original);
    expect(embaralhada).toHaveLength(5);
    expect([...embaralhada].sort()).toEqual(original);
  });

  it("não muta a lista original", () => {
    const original = [1, 2, 3];
    embaralharLista(original);
    expect(original).toEqual([1, 2, 3]);
  });

  it("é determinística quando o random injetado é fixo", () => {
    const semperZero = () => 0;
    expect(embaralharLista([1, 2, 3, 4], semperZero)).toEqual(
      embaralharLista([1, 2, 3, 4], semperZero),
    );
  });
});
