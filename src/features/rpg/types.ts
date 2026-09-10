import type { EffectType, Rarity } from "../authentication/demo/demoUser";

/**
 * Um item do CATÁLOGO da loja (dado estático, igual pra todo mundo) —
 * diferente de `InventoryItem`/`ArmorSlot` em `demoUser.ts`, que são a
 * INSTÂNCIA que um usuário específico possui. Nomes/preços/efeitos
 * portados de `docs/itens_*.json` do app legado (`dev-pwa-biblia-game`) —
 * essa é a fonte mais completa/coerente encontrada lá; o `demo.json` de
 * runtime do legado diverge dela (só 4 das 6 peças de armadura, slots com
 * nomes não-canônicos como "cintura"/"peito") — aqui usamos os 6 slots
 * canônicos corretamente desde o início, sem herdar aquele bug.
 */
export interface CatalogoItem {
  id: string;
  nome: string;
  descricao: string;
  tipo: "consumivel" | "permanente" | "armadura";
  raridade: Rarity;
  precoOuro: number;
  /** Só para `tipo === "armadura"`. */
  slot?: "cinto" | "couraca" | "calçados" | "escudo" | "capacete" | "espada";
  /** Minutos de duração do efeito — só para consumíveis. */
  duracaoMinutos?: number;
  effect: string;
  effectType: EffectType;
}

/**
 * Um efeito de consumível em andamento (RF — "loja" T-010). Espelha o
 * conceito de `efeitos_ativos` do legado (slots limitados e concorrentes,
 * ver `ativarEfeito`/`RPG_MAX_EFEITOS_ATIVOS` em `inventario.ts`), só que
 * persistido em localStorage em vez de uma tabela Supabase + RPC — mesmo
 * padrão do resto do app nesta fase (domínio puro + localStorage, sem
 * backend real ainda, ver `IA/memory/project-memory.md`).
 */
export interface EfeitoAtivo {
  itemId: string;
  nome: string;
  iniciaEm: string;
  terminaEm: string;
}
