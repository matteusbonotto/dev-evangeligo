import type {
  Achievement,
  ActiveEffect,
  ArmorSlot,
  InventoryItem,
} from "../authentication/demo/demoUser";
import type { AvatarConfig } from "../avatar/types";

const CHAVE = "evangeligo:rpg:estado";

/**
 * Fatia mutável do `DemoUser` que este módulo controla (loja/armadura/
 * inventário/conquistas/nível/avatar) — persistida em `localStorage` pra
 * sobreviver a um recarregamento de página, mesmo padrão já usado por
 * `marcacoes.ts` nesta fase do projeto (sem backend próprio pra
 * gamificação de demonstração — contas reais usam `rpg/estadoReal.ts`,
 * T-047/T-053).
 */
export interface EstadoRpgPersistido {
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  inventory: InventoryItem[];
  armor: ArmorSlot[];
  achievements: Achievement[];
  effects: ActiveEffect[];
  avatarConfig: AvatarConfig;
}

export function carregarEstadoRpg(): EstadoRpgPersistido | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;
    return JSON.parse(bruto) as EstadoRpgPersistido;
  } catch {
    return null;
  }
}

export function salvarEstadoRpg(estado: EstadoRpgPersistido): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // localStorage indisponível (modo privado, quota excedida) — a sessão
    // continua funcionando em memória, só não sobrevive a um refresh.
  }
}
