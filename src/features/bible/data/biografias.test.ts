import { describe, expect, it } from "vitest";
import { LIVROS_BIBLIA } from "./livros";
import { obterInfoLivro } from "./autoresLivros";
import { obterBiografia } from "./biografias";

describe("obterBiografia", () => {
  it("todo autorId referenciado em autoresLivros.ts resolve para uma biografia real", () => {
    for (const livro of LIVROS_BIBLIA) {
      const info = obterInfoLivro(livro.codigo)!;
      if (!info.autorId) continue;
      const bio = obterBiografia(info.autorId);
      expect(
        bio,
        `autorId "${info.autorId}" de ${livro.codigo} não resolve`,
      ).toBeDefined();
    }
  });

  it("toda biografia tem ao menos 1 referência bíblica e um título de Wikipédia", () => {
    for (const livro of LIVROS_BIBLIA) {
      const info = obterInfoLivro(livro.codigo)!;
      if (!info.autorId) continue;
      const bio = obterBiografia(info.autorId)!;
      expect(bio.referenciasBiblicasChave.length, bio.id).toBeGreaterThan(0);
      expect(bio.wikipediaTitulo.length, bio.id).toBeGreaterThan(0);
      expect(bio.papel.length, bio.id).toBeGreaterThan(0);
    }
  });

  it("retorna undefined para um id inexistente", () => {
    expect(obterBiografia("nao-existe")).toBeUndefined();
  });
});
