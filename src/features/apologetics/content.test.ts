import { describe, expect, it } from "vitest";
import {
  CATEGORIAS_APOLOGETICA,
  DICAS_ESTUDO,
  PERGUNTAS_APOLOGETICA,
  getCategoriaById,
} from "./content";
import { perguntaApologeticaSchema } from "./schemas";

describe("CATEGORIAS_APOLOGETICA", () => {
  it("tem 8 categorias (portadas do legado)", () => {
    expect(CATEGORIAS_APOLOGETICA.length).toBe(8);
  });

  it("ids de categoria são únicos", () => {
    const ids = CATEGORIAS_APOLOGETICA.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("PERGUNTAS_APOLOGETICA", () => {
  it("tem 19 perguntas (portadas 1:1 do apologetica.js legado)", () => {
    expect(PERGUNTAS_APOLOGETICA.length).toBe(19);
  });

  it("ids de pergunta são únicos", () => {
    const ids = PERGUNTAS_APOLOGETICA.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada pergunta é válida pelo schema", () => {
    for (const pergunta of PERGUNTAS_APOLOGETICA) {
      expect(() => perguntaApologeticaSchema.parse(pergunta)).not.toThrow();
    }
  });

  it("cada pergunta referencia uma categoria que realmente existe", () => {
    for (const pergunta of PERGUNTAS_APOLOGETICA) {
      expect(
        getCategoriaById(pergunta.categoria),
        `categoria "${pergunta.categoria}" da pergunta "${pergunta.id}"`,
      ).toBeDefined();
    }
  });

  it("todo nível de dificuldade tem ao menos 1 pergunta", () => {
    const dificuldades = new Set(PERGUNTAS_APOLOGETICA.map((p) => p.dificuldade));
    expect(dificuldades).toEqual(
      new Set(["iniciante", "intermediario", "avancado"]),
    );
  });

  it("nenhuma resposta ou referência está vazia", () => {
    for (const pergunta of PERGUNTAS_APOLOGETICA) {
      expect(pergunta.resposta.length, pergunta.id).toBeGreaterThan(0);
      expect(pergunta.referencias.length, pergunta.id).toBeGreaterThan(0);
      expect(pergunta.pontosChave.length, pergunta.id).toBeGreaterThan(0);
    }
  });
});

describe("getCategoriaById", () => {
  it("encontra uma categoria existente", () => {
    expect(getCategoriaById("sofrimento-mal")?.nome).toBe("Sofrimento e Mal");
  });

  it("retorna undefined para id inexistente", () => {
    expect(getCategoriaById("categoria-inexistente")).toBeUndefined();
  });
});

describe("DICAS_ESTUDO", () => {
  it("tem ao menos 1 dica", () => {
    expect(DICAS_ESTUDO.length).toBeGreaterThan(0);
  });
});
