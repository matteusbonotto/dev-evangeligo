import { describe, expect, it } from "vitest";
import { obterFalante } from "./falasEspeciais";

describe("obterFalante", () => {
  it("identifica o Sermão do Monte (Mateus 5-7) como fala de Jesus", () => {
    expect(obterFalante("MAT", 5, 3)).toBe("jesus");
    expect(obterFalante("MAT", 6, 15)).toBe("jesus");
    expect(obterFalante("MAT", 7, 27)).toBe("jesus");
  });

  it("não marca o versículo de narração logo antes do Sermão do Monte", () => {
    expect(obterFalante("MAT", 5, 2)).toBeNull();
  });

  it("não marca o versículo de narração logo depois do Sermão do Monte", () => {
    expect(obterFalante("MAT", 7, 28)).toBeNull();
  });

  it("identifica o Discurso de Despedida (João 14-17) como fala de Jesus", () => {
    expect(obterFalante("JHN", 14, 6)).toBe("jesus");
    expect(obterFalante("JHN", 17, 1)).toBe("jesus");
  });

  it("identifica Paulo citando Jesus (1 Coríntios 11:24-25) como fala de Jesus", () => {
    expect(obterFalante("1CO", 11, 24)).toBe("jesus");
  });

  it("identifica os Dez Mandamentos (Êxodo 20) como fala de Deus", () => {
    expect(obterFalante("EXO", 20, 2)).toBe("deus");
    expect(obterFalante("EXO", 20, 17)).toBe("deus");
  });

  it("não marca o versículo de narração antes dos Dez Mandamentos", () => {
    expect(obterFalante("EXO", 20, 1)).toBeNull();
  });

  it("identifica a voz do céu no batismo de Jesus (Mateus 3:17) como fala de Deus", () => {
    expect(obterFalante("MAT", 3, 17)).toBe("deus");
  });

  it("não confunde o próprio versículo do batismo (Mateus 3:15, Jesus falando) com Deus", () => {
    expect(obterFalante("MAT", 3, 15)).toBe("jesus");
  });

  it("retorna null para um livro sem nenhuma faixa marcada", () => {
    expect(obterFalante("RUT", 1, 1)).toBeNull();
  });

  it("retorna null para um capítulo fora de qualquer faixa marcada", () => {
    expect(obterFalante("MAT", 1, 1)).toBeNull();
  });
});
