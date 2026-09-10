import { describe, expect, it } from "vitest";
import {
  alternarEquiparArmadura,
  RPG_MAX_EFEITOS_ATIVOS,
  usarConsumivel,
  venderArmadura,
  venderItemInventario,
} from "./inventario";
import { comprarItem } from "./loja";
import { criarUsuarioDeTeste } from "./testUtils";
import type { ArmorSlot } from "../authentication/demo/demoUser";

function pecaArmadura(overrides: Partial<ArmorSlot> = {}): ArmorSlot {
  return {
    slot: "cinto",
    name: "Cinto da Verdade",
    equipped: false,
    rarity: "comum",
    level: 1,
    effect: "+5% de ouro",
    effectType: "passivo",
    ...overrides,
  };
}

describe("alternarEquiparArmadura", () => {
  it("recusa equipar um slot que o usuário não possui", () => {
    const usuario = criarUsuarioDeTeste();
    const resultado = alternarEquiparArmadura(usuario, "cinto");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/não possui/i);
  });

  it("equipa uma peça não-equipada", () => {
    const usuario = criarUsuarioDeTeste({ armor: [pecaArmadura({ equipped: false })] });
    const resultado = alternarEquiparArmadura(usuario, "cinto");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.usuario.armor[0].equipped).toBe(true);
  });

  it("desequipa uma peça equipada", () => {
    const usuario = criarUsuarioDeTeste({ armor: [pecaArmadura({ equipped: true })] });
    const resultado = alternarEquiparArmadura(usuario, "cinto");
    expect(resultado.usuario.armor[0].equipped).toBe(false);
  });

  it("equipar a 6ª peça desbloqueia 'Soldado de Cristo' e credita XP/ouro", () => {
    // Raridades misturadas de propósito: só "Soldado de Cristo" (6 peças,
    // qualquer raridade) deve disparar aqui — se todas fossem "comum" por
    // acaso, "Armadura Completa de Deus" (6 peças da MESMA raridade)
    // também dispararia e o teste ficaria acoplado às duas ao mesmo tempo.
    const pecas: Array<[ArmorSlot["slot"], ArmorSlot["rarity"]]> = [
      ["couraca", "raro"],
      ["calçados", "epico"],
      ["escudo", "lendario"],
      ["capacete", "comum"],
      ["espada", "raro"],
    ];
    const armor = [
      ...pecas.map(([slot, rarity]) =>
        pecaArmadura({ slot, rarity, equipped: true, name: slot }),
      ),
      pecaArmadura({ slot: "cinto", rarity: "comum", equipped: false }),
    ];
    const usuario = criarUsuarioDeTeste({ armor, gold: 0, xp: 0, level: 1 });
    const resultado = alternarEquiparArmadura(usuario, "cinto");
    expect(resultado.usuario.armor.every((p) => p.equipped)).toBe(true);
    expect(
      resultado.usuario.achievements.some((a) => a.id === "soldado-de-cristo"),
    ).toBe(true);
    expect(
      resultado.usuario.achievements.some((a) => a.id === "armadura-completa"),
    ).toBe(false);
    expect(resultado.usuario.gold).toBe(100); // reward.gold só de "Soldado de Cristo"
  });

  it("não desbloqueia a mesma conquista duas vezes (idempotente)", () => {
    const slots: ArmorSlot["slot"][] = [
      "cinto",
      "couraca",
      "calçados",
      "escudo",
      "capacete",
      "espada",
    ];
    const armor = slots.map((slot) => pecaArmadura({ slot, equipped: true, name: slot }));
    const usuario = criarUsuarioDeTeste({ armor });
    // desequipa e reequipa o cinto — já tinha as 6 antes, não deve duplicar a conquista
    const desequipado = alternarEquiparArmadura(usuario, "cinto");
    const reequipado = alternarEquiparArmadura(desequipado.usuario, "cinto");
    const ocorrencias = reequipado.usuario.achievements.filter(
      (a) => a.id === "soldado-de-cristo",
    );
    expect(ocorrencias).toHaveLength(1);
  });
});

describe("venderArmadura", () => {
  it("recusa vender um slot vazio", () => {
    const usuario = criarUsuarioDeTeste();
    const resultado = venderArmadura(usuario, "cinto");
    expect(resultado.sucesso).toBe(false);
  });

  it("vende por metade do preço de catálogo e remove do slot", () => {
    const comprado = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-cinto"); // 20 ouro
    const vendido = venderArmadura(comprado.usuario, "cinto");
    expect(vendido.sucesso).toBe(true);
    expect(vendido.usuario.armor).toHaveLength(0);
    expect(vendido.usuario.gold).toBe(80 + 10); // 100 - 20 (compra) + 10 (metade de 20)
  });

  it("com o Cinto da Verdade equipado, a venda soma +5% de ouro", () => {
    const cintoEquipado = comprarItem(criarUsuarioDeTeste({ gold: 200 }), "item-cinto");
    const comEspada = comprarItem(cintoEquipado.usuario, "item-espada"); // 100 ouro, venda base 50
    const equipado = {
      ...comEspada.usuario,
      armor: comEspada.usuario.armor.map((p) =>
        p.slot === "cinto" ? { ...p, equipped: true } : p,
      ),
    };
    const vendido = venderArmadura(equipado, "espada");
    // 50 (metade de 100) + 5% arredondado pra cima = 50 + 3 = 53
    expect(vendido.usuario.gold - equipado.gold).toBe(53);
  });
});

describe("venderItemInventario", () => {
  it("decrementa quantidade em vez de remover quando há mais de 1", () => {
    const primeira = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-pao");
    const segunda = comprarItem(primeira.usuario, "item-pao");
    const vendido = venderItemInventario(segunda.usuario, "item-pao");
    expect(vendido.usuario.inventory[0].quantity).toBe(1);
  });

  it("remove a linha quando a quantidade chega a 0", () => {
    const comprado = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-pao");
    const vendido = venderItemInventario(comprado.usuario, "item-pao");
    expect(vendido.usuario.inventory).toHaveLength(0);
  });
});

describe("usarConsumivel", () => {
  it("recusa usar um item que não é consumível", () => {
    const comprado = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-harpa");
    const resultado = usarConsumivel(comprado.usuario, "item-harpa");
    expect(resultado.sucesso).toBe(false);
  });

  it("consome 1 unidade e ativa o efeito com a duração correta", () => {
    const comprado = comprarItem(criarUsuarioDeTeste({ gold: 100 }), "item-pao"); // 25 min
    const agora = new Date("2026-09-08T10:00:00.000Z");
    const resultado = usarConsumivel(comprado.usuario, "item-pao", agora);
    expect(resultado.sucesso).toBe(true);
    expect(resultado.usuario.inventory).toHaveLength(0);
    expect(resultado.usuario.effects).toHaveLength(1);
    expect(resultado.usuario.effects[0].terminaEm).toBe(
      new Date(agora.getTime() + 25 * 60_000).toISOString(),
    );
  });

  it(`bloqueia o uso quando já há ${RPG_MAX_EFEITOS_ATIVOS} efeitos ativos`, () => {
    let usuario = criarUsuarioDeTeste({ gold: 1000 });
    for (const id of ["item-pao", "item-tocha", "item-foco"]) {
      usuario = comprarItem(usuario, id).usuario;
    }
    const agora = new Date("2026-09-08T10:00:00.000Z");
    for (const id of ["item-pao", "item-tocha", "item-foco"]) {
      usuario = usarConsumivel(usuario, id, agora).usuario;
    }
    usuario = comprarItem(usuario, "item-protecao-fe").usuario;
    const resultado = usarConsumivel(usuario, "item-protecao-fe", agora);
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toMatch(/ocupados/i);
  });

  it("efeitos já expirados não contam pro limite de slots", () => {
    let usuario = criarUsuarioDeTeste({ gold: 1000 });
    for (const id of ["item-pao", "item-tocha", "item-foco"]) {
      usuario = comprarItem(usuario, id).usuario;
    }
    const agora = new Date("2026-09-08T10:00:00.000Z");
    for (const id of ["item-pao", "item-tocha", "item-foco"]) {
      usuario = usarConsumivel(usuario, id, agora).usuario;
    }
    usuario = comprarItem(usuario, "item-protecao-fe").usuario;
    const bemDepois = new Date(agora.getTime() + 24 * 60 * 60_000);
    const resultado = usarConsumivel(usuario, "item-protecao-fe", bemDepois);
    expect(resultado.sucesso).toBe(true);
  });
});
