import type { ArmorSlot, Rarity } from "../authentication/demo/demoUser";
import { ARMOR_SLOTS } from "../dashboard/armorSlots";

/** Quantas das 6 peças estão equipadas agora (0-6). */
export function contarPecasEquipadas(armor: ArmorSlot[]): number {
  const bySlot = new Map(armor.map((piece) => [piece.slot, piece]));
  return ARMOR_SLOTS.filter(({ slot }) => bySlot.get(slot)?.equipped).length;
}

/** `true` só quando as 6 peças estão equipadas E são todas da mesma raridade — condição do bônus de conjunto (`ARMOR_SET_BONUSES`) e da conquista "Armadura Completa de Deus". */
export function raridadeDoConjuntoCompleto(armor: ArmorSlot[]): Rarity | null {
  if (contarPecasEquipadas(armor) !== ARMOR_SLOTS.length) return null;
  const raridades = new Set(
    armor.filter((piece) => piece.equipped).map((piece) => piece.rarity),
  );
  return raridades.size === 1 ? Array.from(raridades)[0] : null;
}

/**
 * Escudo da Fé equipado — liga o Escudo da Fé real (`SHIELD_OF_FAITH_PROTECTION_CHANCE`,
 * 20% de chance de bloquear a perda de coração) em `src/features/study/quiz/engine.ts`,
 * ao estado de armadura de verdade em vez do `hasShieldOfFaith: false` fixo que existia
 * antes do T-010 (`QuizPage.tsx`) — o único bônus de peça com um consumidor de
 * gameplay já implementado e alcançável hoje.
 */
export function temEscudoDaFe(armor: ArmorSlot[]): boolean {
  return armor.some((piece) => piece.slot === "escudo" && piece.equipped);
}

/**
 * Cinto da Verdade equipado — bônus real e alcançável (diferente dos demais
 * efeitos por peça, que hoje só são exibidos, sem um sistema de XP/ouro
 * creditado ao vivo em aulas/leitura pra multiplicar — ver ADR de T-010):
 * soma 5% de ouro extra ao valor de venda de qualquer item (`vender*` em
 * `inventario.ts`), reaproveitando o "+5% de ouro" que já era exibido no
 * anel do HUD antes deste bônus existir de fato.
 */
export function temBonusDeOuroAoVender(armor: ArmorSlot[]): boolean {
  return armor.some((piece) => piece.slot === "cinto" && piece.equipped);
}
