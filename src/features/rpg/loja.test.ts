import { describe, expect, it } from "vitest";
import { comprarItem } from "./loja";
import { criarUsuarioDeTeste } from "./testUtils";

describe("comprarItem", () => {
  it("recusa item inexistente no catálogo", () => {
    const usuario = criarUsuarioDeTeste();
    const resultado = comprarItem(usuario, "item-que-nao-existe");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/não encontrado/i);
    expect(resultado.usuario).toBe(usuario);
  });

  it("recusa compra sem ouro suficiente", () => {
    const usuario = criarUsuarioDeTeste({ gold: 5 });
    const resultado = comprarItem(usuario, "item-cinto"); // 20 ouro
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/ouro insuficiente/i);
    expect(resultado.usuario.gold).toBe(5);
  });

  it("compra uma peça de armadura nova: desconta ouro e adiciona ao slot, desequipada", () => {
    const usuario = criarUsuarioDeTeste({ gold: 100 });
    const resultado = comprarItem(usuario, "item-cinto");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.usuario.gold).toBe(80);
    expect(resultado.usuario.armor).toHaveLength(1);
    expect(resultado.usuario.armor[0]).toMatchObject({
      slot: "cinto",
      name: "Cinto da Verdade",
      equipped: false,
    });
  });

  it("recomprar uma peça de armadura já equipada substitui o item mas mantém equipada", () => {
    const primeira = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-cinto");
    const equipado = {
      ...primeira.usuario,
      armor: primeira.usuario.armor.map((p) => ({ ...p, equipped: true })),
    };
    const segunda = comprarItem(equipado, "item-cinto");
    expect(segunda.usuario.armor).toHaveLength(1);
    expect(segunda.usuario.armor[0].equipped).toBe(true);
  });

  it("compra um consumível novo com quantidade 1", () => {
    const usuario = criarUsuarioDeTeste({ gold: 100 });
    const resultado = comprarItem(usuario, "item-pao");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.usuario.inventory).toHaveLength(1);
    expect(resultado.usuario.inventory[0]).toMatchObject({
      id: "item-pao",
      quantity: 1,
      type: "consumivel",
    });
  });

  it("comprar o mesmo consumível de novo soma a quantidade", () => {
    const primeira = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-pao");
    const segunda = comprarItem(primeira.usuario, "item-pao");
    expect(segunda.usuario.inventory).toHaveLength(1);
    expect(segunda.usuario.inventory[0].quantity).toBe(2);
  });

  it("recusa comprar um item permanente que já possui (correção de um bug real do legado, que empilhava sem aviso)", () => {
    const primeira = comprarItem(criarUsuarioDeTeste({ gold: 200 }), "item-harpa");
    const segunda = comprarItem(primeira.usuario, "item-harpa");
    expect(segunda.sucesso).toBe(false);
    expect(segunda.erro).toMatch(/já possui/i);
    expect(segunda.usuario.inventory).toHaveLength(1);
    expect(segunda.usuario.inventory[0].quantity).toBe(1);
  });
});
