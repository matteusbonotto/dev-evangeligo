import type { CatalogoItem } from "./types";

/**
 * Catálogo de itens da loja — dado estático, igual pra toda conta.
 *
 * Nomes/efeitos das 6 peças de armadura e dos itens já existentes no
 * inventário/HUD (`demoUser.ts`) são reaproveitados tal como já
 * aparecem hoje na tela (nunca reescritos aqui) — o preço em ouro é o
 * único campo novo, sem equivalente prévio na UI. Os preços em si vêm
 * de `docs/itens_armadura.json` do app legado quando o nome bate; onde
 * não bate (os 5 consumíveis e os 4 permanentes já eram nomes PRÓPRIOS
 * desta reconstrução, sem equivalente no legado — ver pesquisa da
 * sessão de T-010), o preço foi definido do zero, calibrado contra o
 * ouro inicial da conta demo (320).
 */
export const CATALOGO_ARMADURA: CatalogoItem[] = [
  {
    id: "item-cinto",
    nome: "Cinto da Verdade",
    descricao: "Efésios 6:14 — \"Estai, pois, firmes, tendo cingidos os vossos lombos com a verdade.\"",
    tipo: "armadura",
    slot: "cinto",
    raridade: "comum",
    precoOuro: 20,
    effect: "+5% de ouro",
    effectType: "passivo",
  },
  {
    id: "item-couraca",
    nome: "Couraça da Justiça",
    descricao: "Efésios 6:14 — \"e vestida a couraça da justiça.\"",
    tipo: "armadura",
    slot: "couraca",
    raridade: "lendario",
    precoOuro: 50,
    effect: "Reduz dano de coração em 30%",
    effectType: "passivo",
  },
  {
    id: "item-calcados",
    nome: "Calçados do Evangelho",
    descricao: "Efésios 6:15 — \"calçados os pés na preparação do evangelho da paz.\"",
    tipo: "armadura",
    slot: "calçados",
    raridade: "raro",
    precoOuro: 35,
    effect: "Sequência não quebra em 1 dia de folga",
    effectType: "passivo",
  },
  {
    id: "item-escudo",
    nome: "Escudo da Fé",
    descricao: "Efésios 6:16 — \"tomando sobretudo o escudo da fé.\"",
    tipo: "armadura",
    slot: "escudo",
    raridade: "raro",
    precoOuro: 75,
    effect: "Bloqueia 1 erro por quiz",
    effectType: "reativo",
  },
  {
    id: "item-capacete",
    nome: "Capacete da Salvação",
    descricao: "Efésios 6:17 — \"tomai também o capacete da salvação.\"",
    tipo: "armadura",
    slot: "capacete",
    raridade: "epico",
    precoOuro: 60,
    effect: "+10% de XP em aulas",
    effectType: "passivo",
  },
  {
    id: "item-espada",
    nome: "Espada do Espírito",
    descricao: "Efésios 6:17 — \"e a espada do Espírito, que é a palavra de Deus.\"",
    tipo: "armadura",
    slot: "espada",
    raridade: "lendario",
    precoOuro: 100,
    effect: "A cada 3 acertos, +1 coração",
    effectType: "reativo",
  },
];

export const CATALOGO_CONSUMIVEIS: CatalogoItem[] = [
  {
    id: "item-pao",
    nome: "Pão da Vida",
    descricao: "Recupera energia para continuar.",
    tipo: "consumivel",
    raridade: "comum",
    precoOuro: 8,
    duracaoMinutos: 25,
    effect: "Recupera energia para continuar",
    effectType: "passivo",
  },
  {
    id: "item-tocha",
    nome: "Tocha da Verdade",
    descricao: "Revela uma dica em um quiz.",
    tipo: "consumivel",
    raridade: "comum",
    precoOuro: 18,
    duracaoMinutos: 15,
    effect: "Revela uma dica em um quiz",
    effectType: "reativo",
  },
  {
    id: "item-foco",
    nome: "Poção de Foco",
    descricao: "Ganha +XP em quizzes.",
    tipo: "consumivel",
    raridade: "comum",
    precoOuro: 12,
    duracaoMinutos: 20,
    effect: "Ganha +XP em quizzes",
    effectType: "passivo",
  },
  {
    id: "item-protecao-fe",
    nome: "Proteção da Fé",
    descricao: "Protege 20% dos corações em um quiz.",
    tipo: "consumivel",
    raridade: "raro",
    precoOuro: 15,
    duracaoMinutos: 30,
    effect: "Protege 20% dos corações em um quiz",
    effectType: "passivo",
  },
  {
    id: "item-coracao",
    nome: "Coração Extra",
    descricao: "Recupera um coração perdido.",
    tipo: "consumivel",
    raridade: "raro",
    precoOuro: 25,
    effect: "Recupera um coração perdido",
    effectType: "reativo",
  },
];

export const CATALOGO_PERMANENTES: CatalogoItem[] = [
  {
    id: "item-catecismo",
    nome: "Catecismo de Heidelberg",
    descricao: "Referência permanente de doutrina.",
    tipo: "permanente",
    raridade: "raro",
    precoOuro: 35,
    effect: "Referência permanente de doutrina",
    effectType: "passivo",
  },
  {
    id: "item-harpa",
    nome: "Harpa Cristã",
    descricao: "Referência permanente de hinos.",
    tipo: "permanente",
    raridade: "raro",
    precoOuro: 30,
    effect: "Referência permanente de hinos",
    effectType: "passivo",
  },
  {
    id: "item-biblia-estudo",
    nome: "Bíblia de Estudo",
    descricao: "Referência permanente das Escrituras.",
    tipo: "permanente",
    raridade: "epico",
    precoOuro: 40,
    effect: "Referência permanente das Escrituras",
    effectType: "passivo",
  },
  {
    id: "item-calvino",
    nome: "Comentário de Calvino",
    descricao: "Referência permanente de exegese.",
    tipo: "permanente",
    raridade: "epico",
    precoOuro: 45,
    effect: "Referência permanente de exegese",
    effectType: "passivo",
  },
];

export const CATALOGO: CatalogoItem[] = [
  ...CATALOGO_ARMADURA,
  ...CATALOGO_CONSUMIVEIS,
  ...CATALOGO_PERMANENTES,
];

export function obterItemDoCatalogo(itemId: string): CatalogoItem | null {
  return CATALOGO.find((item) => item.id === itemId) ?? null;
}

/** Percentual de reembolso ao vender um item — metade do preço de compra (mesma regra do legado, `venderItem`). */
export const PERCENTUAL_VENDA = 0.5;

export function calcularValorVenda(item: CatalogoItem): number {
  return Math.floor(item.precoOuro * PERCENTUAL_VENDA);
}
