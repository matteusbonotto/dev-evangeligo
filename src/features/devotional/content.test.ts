import { describe, expect, it } from "vitest";
import { getLivroByOrder } from "../bible/data/livros";
import { DEVOCIONAIS, getDevocionalById } from "./content";
import { devocionalEntrySchema } from "./schemas";

describe("DEVOCIONAIS", () => {
  it("tem ao menos 10 devocionais", () => {
    expect(DEVOCIONAIS.length).toBeGreaterThanOrEqual(10);
  });

  it("ids são únicos", () => {
    const ids = DEVOCIONAIS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cada devocional é válido pelo schema", () => {
    for (const devocional of DEVOCIONAIS) {
      expect(() => devocionalEntrySchema.parse(devocional)).not.toThrow();
    }
  });

  it("toda referência bíblica aponta para um livro real (livroOrder existente)", () => {
    for (const devocional of DEVOCIONAIS) {
      const livro = getLivroByOrder(devocional.referencia.livroOrder);
      expect(livro, `livro da referência "${devocional.id}"`).toBeDefined();
    }
  });

  it("nenhuma reflexão ou aplicação está vazia", () => {
    for (const devocional of DEVOCIONAIS) {
      expect(devocional.reflexao.length, devocional.id).toBeGreaterThan(0);
      for (const paragrafo of devocional.reflexao) {
        expect(paragrafo.length, devocional.id).toBeGreaterThan(0);
      }
      expect(devocional.aplicacao.length, devocional.id).toBeGreaterThan(0);
    }
  });

  it("nenhuma reflexão ou aplicação usa linguagem de mérito espiritual (regra 20)", () => {
    const termosProibidos = ["voce merece", "você merece", "ganhar a salvação", "merece a salvação"];
    for (const devocional of DEVOCIONAIS) {
      const textoCompleto = [...devocional.reflexao, devocional.aplicacao]
        .join(" ")
        .toLowerCase();
      for (const termo of termosProibidos) {
        expect(textoCompleto.includes(termo), `"${termo}" em "${devocional.id}"`).toBe(false);
      }
    }
  });
});

describe("getDevocionalById", () => {
  it("encontra um devocional existente", () => {
    expect(getDevocionalById("graca-salvadora")?.titulo).toBe(
      "Uma graça que não se compra",
    );
  });

  it("retorna undefined para id inexistente", () => {
    expect(getDevocionalById("id-inexistente")).toBeUndefined();
  });
});
