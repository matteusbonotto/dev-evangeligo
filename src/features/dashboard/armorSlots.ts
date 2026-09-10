import {
  GiBelt,
  GiBoots,
  GiBroadsword,
  GiChestArmor,
  GiHelmet,
  GiShield,
} from "react-icons/gi";
import type { ArmorSlot, Rarity } from "../authentication/demo/demoUser";

export interface ArmorSlotMeta {
  slot: ArmorSlot["slot"];
  label: string;
  Icon: typeof GiBelt;
  angle: number;
}

export const ARMOR_SLOTS: ArmorSlotMeta[] = [
  {
    slot: "capacete",
    label: "Capacete da Salvação",
    Icon: GiHelmet,
    angle: -90,
  },
  {
    slot: "espada",
    label: "Espada do Espírito",
    Icon: GiBroadsword,
    angle: -30,
  },
  {
    slot: "couraca",
    label: "Couraça da Justiça",
    Icon: GiChestArmor,
    angle: 30,
  },
  {
    slot: "calçados",
    label: "Calçados do Evangelho",
    Icon: GiBoots,
    angle: 90,
  },
  { slot: "cinto", label: "Cinto da Verdade", Icon: GiBelt, angle: 150 },
  { slot: "escudo", label: "Escudo da Fé", Icon: GiShield, angle: 210 },
];

/**
 * Bônus de conjunto (Efésios 6:11 — "toda a armadura de Deus") quando as 6
 * peças estão equipadas e são da mesma raridade. Efeito de jogo (XP/ouro/
 * corações), não mérito espiritual — a proteção é de Deus, o bônus é só
 * reforço pedagógico de constância (ver `IA/agents/rpg.md`).
 */
export const ARMOR_SET_BONUSES: Record<
  Rarity,
  { title: string; effect: string }
> = {
  comum: {
    title: "Conjunto do Soldado",
    effect: "+5% de XP e ouro em todas as atividades",
  },
  raro: {
    title: "Conjunto do Guerreiro Fiel",
    effect: "+10% de XP e ouro; 1 dia extra de folga sem quebrar a sequência",
  },
  epico: {
    title: "Conjunto do Vencedor",
    effect: "+15% de XP e ouro; +1 coração no início de cada dia",
  },
  lendario: {
    title: "Armadura Completa de Deus",
    effect:
      "+20% de XP e ouro; bloqueia a perda do primeiro erro em todo quiz do dia",
  },
};
