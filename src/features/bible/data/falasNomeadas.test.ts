import { describe, expect, it } from "vitest";
import { obterFalanteNomeado } from "./falasNomeadas";
import { obterBiografia } from "./biografias";
import { obterFalante } from "./falasEspeciais";

describe("obterFalanteNomeado", () => {
  it("identifica a confissão de Pedro (Mateus 16:16)", () => {
    expect(obterFalanteNomeado("MAT", 16, 16)).toBe("pedro");
  });

  it("não confunde a pergunta/resposta de Jesus ao redor da confissão de Pedro", () => {
    expect(obterFalanteNomeado("MAT", 16, 15)).toBeNull();
    expect(obterFalanteNomeado("MAT", 16, 17)).toBeNull();
  });

  it("identifica a negação de Pedro (Mateus 26:69-75)", () => {
    expect(obterFalanteNomeado("MAT", 26, 69)).toBe("pedro");
    expect(obterFalanteNomeado("MAT", 26, 75)).toBe("pedro");
  });

  it("identifica a confissão de Tomé (João 20:28)", () => {
    expect(obterFalanteNomeado("JHN", 20, 28)).toBe("tome");
  });

  it("identifica o Magnificat de Maria (Lucas 1:46-55)", () => {
    expect(obterFalanteNomeado("LUK", 1, 46)).toBe("maria-mae-de-jesus");
    expect(obterFalanteNomeado("LUK", 1, 55)).toBe("maria-mae-de-jesus");
    expect(obterFalanteNomeado("LUK", 1, 45)).toBeNull();
  });

  it("identifica o testemunho de Paulo em Atos 22 e 26", () => {
    expect(obterFalanteNomeado("ACT", 22, 6)).toBe("paulo");
    expect(obterFalanteNomeado("ACT", 26, 14)).toBe("paulo");
  });

  it("retorna null para um livro sem nenhuma faixa nomeada", () => {
    expect(obterFalanteNomeado("RUT", 1, 1)).toBeNull();
  });

  it("todo biografiaId usado aqui resolve em data/biografias.ts", () => {
    const idsUsados = new Set<string>();
    // Amostragem: reconsulta cada faixa conhecida diretamente pelas
    // referências já testadas acima, evitando expor o array interno.
    for (const [codigo, capitulo, versiculo] of [
      ["MAT", 16, 16],
      ["MAT", 26, 70],
      ["JHN", 20, 28],
      ["LUK", 1, 50],
      ["ACT", 7, 56],
      ["ACT", 22, 10],
      ["ACT", 26, 15],
    ] as const) {
      const id = obterFalanteNomeado(codigo, capitulo, versiculo);
      expect(id, `${codigo} ${capitulo}:${versiculo}`).not.toBeNull();
      if (id) idsUsados.add(id);
    }
    for (const id of idsUsados) {
      expect(
        obterBiografia(id),
        `biografiaId "${id}" não resolve`,
      ).toBeDefined();
    }
  });

  it("coexiste sem conflito com falasEspeciais.ts (camadas independentes)", () => {
    // Atos 22:7 é fala de Jesus (vermelho, falasEspeciais) DENTRO do
    // testemunho de Paulo (falasNomeadas) — as duas coisas são
    // verdadeiras ao mesmo tempo, cada camada respondendo uma pergunta.
    expect(obterFalante("ACT", 22, 7)).toBe("jesus");
    expect(obterFalanteNomeado("ACT", 22, 7)).toBe("paulo");
  });
});
