import { describe, expect, it } from "vitest";
import {
  CATEGORIAS_AVATAR,
  FUNDOS_AVATAR,
  getFundoByValor,
} from "./opcoesAvatar";
import { CONFIG_AVATAR_PADRAO } from "../avatarUrl";

describe("CATEGORIAS_AVATAR", () => {
  it("cobre as 11 categorias de customização do avataaars.io", () => {
    expect(CATEGORIAS_AVATAR).toHaveLength(11);
  });

  it("cada categoria tem ao menos 2 opções, cada uma com valor e rótulo", () => {
    for (const categoria of CATEGORIAS_AVATAR) {
      expect(categoria.opcoes.length, categoria.campo).toBeGreaterThanOrEqual(
        2,
      );
      for (const opcao of categoria.opcoes) {
        expect(opcao.valor.length, categoria.campo).toBeGreaterThan(0);
        expect(opcao.label.length, categoria.campo).toBeGreaterThan(0);
      }
    }
  });

  it("o valor padrão de cada campo existe entre as opções da categoria correspondente", () => {
    for (const categoria of CATEGORIAS_AVATAR) {
      const valorPadrao = CONFIG_AVATAR_PADRAO[categoria.campo];
      const existe = categoria.opcoes.some((o) => o.valor === valorPadrao);
      expect(existe, `${categoria.campo}: ${valorPadrao}`).toBe(true);
    }
  });
});

describe("FUNDOS_AVATAR", () => {
  it("tem ao menos 5 opções de fundo", () => {
    expect(FUNDOS_AVATAR.length).toBeGreaterThanOrEqual(5);
  });

  it("o fundo padrão existe na lista", () => {
    expect(
      FUNDOS_AVATAR.some((f) => f.valor === CONFIG_AVATAR_PADRAO.fundo),
    ).toBe(true);
  });
});

describe("getFundoByValor", () => {
  it("retorna o fundo pedido", () => {
    expect(getFundoByValor("dourado").label).toBe("Dourado");
  });

  it("retorna o primeiro fundo como fallback para um valor inexistente", () => {
    expect(getFundoByValor("xxx")).toEqual(FUNDOS_AVATAR[0]);
  });
});
