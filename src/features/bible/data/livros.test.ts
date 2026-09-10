import { describe, expect, it } from "vitest";
import {
  GRUPOS_BIBLIA,
  LIVROS_BIBLIA,
  ORDEM_CRONOLOGICA,
  getLivroByCodigo,
  getLivroByOrder,
  getLivrosFiltrados,
} from "./livros";

describe("LIVROS_BIBLIA", () => {
  it("tem exatamente 66 livros", () => {
    expect(LIVROS_BIBLIA).toHaveLength(66);
  });

  it("order é sequencial de 1 a 66 sem lacunas nem duplicatas", () => {
    const orders = LIVROS_BIBLIA.map((l) => l.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  it("códigos são únicos", () => {
    const codigos = LIVROS_BIBLIA.map((l) => l.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it("tem 39 livros do Antigo Testamento e 27 do Novo Testamento", () => {
    const at = LIVROS_BIBLIA.filter((l) => l.testamento === "AT");
    const nt = LIVROS_BIBLIA.filter((l) => l.testamento === "NT");
    expect(at).toHaveLength(39);
    expect(nt).toHaveLength(27);
  });

  it("todo livro tem nome e totalCapitulos positivos", () => {
    for (const livro of LIVROS_BIBLIA) {
      expect(livro.nome.trim().length).toBeGreaterThan(0);
      expect(livro.totalCapitulos).toBeGreaterThan(0);
    }
  });

  it("Gênesis é o primeiro livro com 50 capítulos e Apocalipse o último com 22", () => {
    expect(LIVROS_BIBLIA[0]).toMatchObject({
      codigo: "GEN",
      nome: "Gênesis",
      totalCapitulos: 50,
    });
    expect(LIVROS_BIBLIA[65]).toMatchObject({
      codigo: "REV",
      nome: "Apocalipse",
      totalCapitulos: 22,
    });
  });

  it("Salmos tem 150 capítulos", () => {
    expect(getLivroByCodigo("PSA")?.totalCapitulos).toBe(150);
  });

  it("todo livro tem um grupo temático válido", () => {
    const gruposValidos = new Set(GRUPOS_BIBLIA.map((g) => g.id));
    for (const livro of LIVROS_BIBLIA) {
      expect(gruposValidos.has(livro.grupo), livro.codigo).toBe(true);
    }
  });

  it("os 7 grupos temáticos somam os 66 livros", () => {
    const total = GRUPOS_BIBLIA.reduce(
      (soma, grupo) =>
        soma + LIVROS_BIBLIA.filter((l) => l.grupo === grupo.id).length,
      0,
    );
    expect(total).toBe(66);
  });
});

describe("ORDEM_CRONOLOGICA", () => {
  it("tem os 66 códigos de livro, cada um uma única vez", () => {
    expect(ORDEM_CRONOLOGICA).toHaveLength(66);
    expect(new Set(ORDEM_CRONOLOGICA).size).toBe(66);
    const codigosCanonicos = new Set(LIVROS_BIBLIA.map((l) => l.codigo));
    for (const codigo of ORDEM_CRONOLOGICA) {
      expect(codigosCanonicos.has(codigo), codigo).toBe(true);
    }
  });

  it("começa em Gênesis (mas não em Apocalipse, ordem difere da canônica)", () => {
    expect(ORDEM_CRONOLOGICA[0]).toBe("GEN");
    expect(ORDEM_CRONOLOGICA).not.toEqual(LIVROS_BIBLIA.map((l) => l.codigo));
  });
});

describe("getLivrosFiltrados", () => {
  it("'canonico' retorna todos os 66 na ordem padrão", () => {
    expect(getLivrosFiltrados("canonico")).toEqual(LIVROS_BIBLIA);
  });

  it("'cronologico' retorna os 66 na ordem de ORDEM_CRONOLOGICA", () => {
    const resultado = getLivrosFiltrados("cronologico");
    expect(resultado).toHaveLength(66);
    expect(resultado.map((l) => l.codigo)).toEqual(ORDEM_CRONOLOGICA);
  });

  it("'AT'/'NT' filtram por testamento", () => {
    expect(getLivrosFiltrados("AT")).toHaveLength(39);
    expect(getLivrosFiltrados("NT")).toHaveLength(27);
  });

  it("um grupo temático filtra só os livros daquele grupo", () => {
    const evangelhos = getLivrosFiltrados("evangelhos");
    expect(evangelhos.map((l) => l.codigo)).toEqual([
      "MAT",
      "MRK",
      "LUK",
      "JHN",
      "ACT",
    ]);
  });
});

describe("getLivroByCodigo / getLivroByOrder", () => {
  it("getLivroByCodigo é case-insensitive", () => {
    expect(getLivroByCodigo("gen")?.nome).toBe("Gênesis");
    expect(getLivroByCodigo("GEN")?.nome).toBe("Gênesis");
  });

  it("getLivroByCodigo retorna undefined para código inexistente", () => {
    expect(getLivroByCodigo("XXX")).toBeUndefined();
  });

  it("getLivroByOrder resolve pela posição canônica", () => {
    expect(getLivroByOrder(43)?.codigo).toBe("JHN");
  });
});
