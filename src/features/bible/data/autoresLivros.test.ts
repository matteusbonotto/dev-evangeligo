import { describe, expect, it } from "vitest";
import { LIVROS_BIBLIA } from "./livros";
import { obterInfoLivro } from "./autoresLivros";

describe("obterInfoLivro", () => {
  it("tem uma entrada para cada um dos 66 livros de LIVROS_BIBLIA", () => {
    for (const livro of LIVROS_BIBLIA) {
      const info = obterInfoLivro(livro.codigo);
      expect(
        info,
        `faltando InfoLivro para ${livro.codigo} (${livro.nome})`,
      ).toBeDefined();
      expect(info?.codigo).toBe(livro.codigo);
    }
  });

  it("todo InfoLivro tem os campos obrigatórios preenchidos (não vazios)", () => {
    for (const livro of LIVROS_BIBLIA) {
      const info = obterInfoLivro(livro.codigo)!;
      expect(info.autor.length, livro.codigo).toBeGreaterThan(0);
      expect(info.periodoAproximado.length, livro.codigo).toBeGreaterThan(0);
      expect(info.genero.length, livro.codigo).toBeGreaterThan(0);
      expect(
        info.contextoHistoricoCultural.length,
        livro.codigo,
      ).toBeGreaterThan(0);
      expect([
        "Hebraico",
        "Aramaico",
        "Hebraico e Aramaico",
        "Grego",
      ]).toContain(info.idiomaOriginal);
    }
  });

  it("aceita o código em minúsculas", () => {
    expect(obterInfoLivro("jhn")?.codigo).toBe("JHN");
  });

  it("retorna undefined para um código inexistente", () => {
    expect(obterInfoLivro("XYZ")).toBeUndefined();
  });
});
