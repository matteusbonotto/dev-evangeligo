import { describe, expect, it } from "vitest";
import { aulaSchema, trilhaSchema } from "../schemas";
import {
  AULAS,
  getAulaById,
  getAulasByTrilha,
  getTrilhaById,
  getTrilhaBySlug,
  getTrilhaComAulas,
  TRILHAS,
} from "./index";

describe("conteúdo das trilhas de estudo (T-007)", () => {
  it("tem exatamente 5 trilhas", () => {
    expect(TRILHAS).toHaveLength(5);
  });

  it("tem exatamente 17 aulas no total", () => {
    expect(AULAS).toHaveLength(17);
  });

  it("cada trilha é válida conforme o schema de domínio", () => {
    for (const trilha of TRILHAS) {
      expect(() => trilhaSchema.parse(trilha)).not.toThrow();
    }
  });

  it("cada aula é válida conforme o schema de domínio", () => {
    for (const aula of AULAS) {
      expect(() => aulaSchema.parse(aula)).not.toThrow();
    }
  });

  it("toda aula tem título e texto de ensino não vazios", () => {
    for (const aula of AULAS) {
      expect(aula.title.trim().length).toBeGreaterThan(0);
      expect(aula.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it("toda aula tem entre 2 e 4 referências bíblicas explícitas (regra 18)", () => {
    for (const aula of AULAS) {
      expect(aula.bibleReferences.length).toBeGreaterThanOrEqual(2);
      expect(aula.bibleReferences.length).toBeLessThanOrEqual(4);
      for (const ref of aula.bibleReferences) {
        expect(ref.book.trim().length).toBeGreaterThan(0);
        expect(ref.display.trim().length).toBeGreaterThan(0);
        expect(ref.chapter).toBeGreaterThan(0);
        expect(ref.verseStart).toBeGreaterThan(0);
      }
    }
  });

  it("não tem trilhas com id ou slug duplicado", () => {
    const ids = TRILHAS.map((trilha) => trilha.id);
    const slugs = TRILHAS.map((trilha) => trilha.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("não tem aulas com id duplicado", () => {
    const ids = AULAS.map((aula) => aula.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda aula referencia uma trilha existente", () => {
    const trilhaIds = new Set(TRILHAS.map((trilha) => trilha.id));
    for (const aula of AULAS) {
      expect(trilhaIds.has(aula.trilhaId)).toBe(true);
    }
  });

  it("cada trilha tem ao menos 1 aula, numerada sequencialmente a partir de 1", () => {
    for (const trilha of TRILHAS) {
      const aulas = getAulasByTrilha(trilha.id);
      expect(aulas.length).toBeGreaterThan(0);
      aulas.forEach((aula, index) => {
        expect(aula.order).toBe(index + 1);
      });
    }
  });

  it("distribui as 17 aulas entre as trilhas conforme ADR-012", () => {
    const counts = Object.fromEntries(
      TRILHAS.map((trilha) => [trilha.id, getAulasByTrilha(trilha.id).length]),
    );
    expect(counts).toEqual({
      solas: 5,
      tulip: 5,
      soberania: 2,
      pactos: 2,
      "obras-fruto": 3,
    });
  });

  it("as trilhas têm ordem de exibição sequencial única (1 a 5)", () => {
    const orders = TRILHAS.map((trilha) => trilha.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5]);
  });

  it("getTrilhaBySlug/getTrilhaById/getAulaById/getTrilhaComAulas resolvem corretamente", () => {
    const trilha = TRILHAS[0];
    expect(getTrilhaBySlug(trilha.slug)?.id).toBe(trilha.id);
    expect(getTrilhaById(trilha.id)?.slug).toBe(trilha.slug);
    expect(getTrilhaBySlug("trilha-inexistente")).toBeUndefined();

    const aula = AULAS[0];
    expect(getAulaById(aula.id)?.id).toBe(aula.id);
    expect(getAulaById("aula-inexistente")).toBeUndefined();

    const trilhaComAulas = getTrilhaComAulas(trilha.id);
    expect(trilhaComAulas?.aulas.length).toBe(
      getAulasByTrilha(trilha.id).length,
    );
  });

  it("quando presente, quizId é uma string não vazia (T-008 anexa os quizzes)", () => {
    for (const aula of AULAS) {
      if (aula.quizId !== undefined) {
        expect(aula.quizId.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
