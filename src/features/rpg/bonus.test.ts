import { describe, expect, it } from "vitest";
import {
  contarPecasEquipadas,
  raridadeDoConjuntoCompleto,
  temBonusDeOuroAoVender,
  temEscudoDaFe,
} from "./bonus";
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

describe("contarPecasEquipadas", () => {
  it("0 quando não há nenhuma peça", () => {
    expect(contarPecasEquipadas([])).toBe(0);
  });

  it("conta só as equipadas, não as possuídas", () => {
    const armor = [
      pecaArmadura({ slot: "cinto", equipped: true }),
      pecaArmadura({ slot: "escudo", equipped: false }),
    ];
    expect(contarPecasEquipadas(armor)).toBe(1);
  });
});

describe("raridadeDoConjuntoCompleto", () => {
  const TODOS_OS_SLOTS: ArmorSlot["slot"][] = [
    "cinto",
    "couraca",
    "calçados",
    "escudo",
    "capacete",
    "espada",
  ];

  it("null quando faltam peças", () => {
    const armor = TODOS_OS_SLOTS.slice(0, 5).map((slot) =>
      pecaArmadura({ slot, equipped: true, rarity: "raro" }),
    );
    expect(raridadeDoConjuntoCompleto(armor)).toBeNull();
  });

  it("null quando as 6 estão equipadas mas com raridades diferentes", () => {
    const armor = TODOS_OS_SLOTS.map((slot, i) =>
      pecaArmadura({
        slot,
        equipped: true,
        rarity: i === 0 ? "lendario" : "raro",
      }),
    );
    expect(raridadeDoConjuntoCompleto(armor)).toBeNull();
  });

  it("retorna a raridade quando as 6 estão equipadas e são iguais", () => {
    const armor = TODOS_OS_SLOTS.map((slot) =>
      pecaArmadura({ slot, equipped: true, rarity: "epico" }),
    );
    expect(raridadeDoConjuntoCompleto(armor)).toBe("epico");
  });
});

describe("temEscudoDaFe / temBonusDeOuroAoVender", () => {
  it("false quando a peça não está equipada", () => {
    const armor = [pecaArmadura({ slot: "escudo", equipped: false })];
    expect(temEscudoDaFe(armor)).toBe(false);
  });

  it("true só quando o Escudo da Fé está equipado", () => {
    const armor = [pecaArmadura({ slot: "escudo", equipped: true })];
    expect(temEscudoDaFe(armor)).toBe(true);
  });

  it("true só quando o Cinto da Verdade está equipado", () => {
    const armor = [pecaArmadura({ slot: "cinto", equipped: true })];
    expect(temBonusDeOuroAoVender(armor)).toBe(true);
    expect(temEscudoDaFe(armor)).toBe(false);
  });
});
