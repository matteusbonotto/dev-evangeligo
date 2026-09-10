import { describe, expect, it } from "vitest";
import { expandirParaPalavra } from "./selecaoTexto";

describe("expandirParaPalavra", () => {
  const texto = "No princípio era o Verbo.";

  it("expande para a palavra inteira a partir de um offset no meio dela", () => {
    // "princípio" começa em 3, termina em 12.
    expect(expandirParaPalavra(texto, 6)).toEqual({ inicio: 3, fim: 12 });
  });

  it("expande a partir do primeiro caractere da palavra", () => {
    expect(expandirParaPalavra(texto, 0)).toEqual({ inicio: 0, fim: 2 }); // "No"
  });

  it("expande a partir do último caractere da palavra", () => {
    expect(expandirParaPalavra(texto, 1)).toEqual({ inicio: 0, fim: 2 }); // "No"
  });

  it("acentos contam como parte da palavra", () => {
    const resultado = expandirParaPalavra(texto, 5);
    expect(texto.slice(resultado.inicio, resultado.fim)).toBe("princípio");
  });

  it("um clique em cima de um espaço acha a palavra mais próxima", () => {
    // índice 2 é o espaço entre "No" e "princípio".
    const resultado = expandirParaPalavra(texto, 2);
    expect(texto.slice(resultado.inicio, resultado.fim)).toMatch(/No|princípio/);
  });

  it("um clique em cima de pontuação final acha a última palavra", () => {
    const ultimoIndice = texto.length - 1; // "."
    const resultado = expandirParaPalavra(texto, ultimoIndice);
    expect(texto.slice(resultado.inicio, resultado.fim)).toBe("Verbo");
  });

  it("texto vazio retorna um intervalo vazio, sem lançar erro", () => {
    expect(expandirParaPalavra("", 0)).toEqual({ inicio: 0, fim: 0 });
  });
});
