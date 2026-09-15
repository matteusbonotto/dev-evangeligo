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

  it("todo autor de livro (autorId de autoresLivros.ts) tem o campo 'escreveu' preenchido (T-049)", () => {
    for (const livro of LIVROS_BIBLIA) {
      const info = obterInfoLivro(livro.codigo)!;
      if (!info.autorId) continue;
      const bio = obterBiografia(info.autorId)!;
      expect(bio.escreveu, `${bio.id} deveria ter 'escreveu'`).toBeTruthy();
    }
  });

  it("Deus Pai não tem ondeViveu/comoMorreu/filhoDe (não se aplicam teologicamente)", () => {
    const deus = obterBiografia("deus")!;
    expect(deus.ondeViveu).toBeUndefined();
    expect(deus.comoMorreu).toBeUndefined();
    expect(deus.filhoDe).toBeUndefined();
  });

  it("distingue morte narrada na própria Bíblia (Estêvão) de tradição extra-bíblica (Pedro)", () => {
    const estevao = obterBiografia("estevao")!;
    expect(estevao.comoMorreu).toMatch(/Atos 7/);
    expect(estevao.comoMorreu).not.toMatch(/tradição diz|Tradição:/);

    const pedro = obterBiografia("pedro")!;
    expect(pedro.comoMorreu).toMatch(/tradição/);
  });
});
