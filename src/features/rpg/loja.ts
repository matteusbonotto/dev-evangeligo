import type {
  ArmorSlot,
  DemoUser,
  InventoryItem,
} from "../authentication/demo/demoUser";
import { obterItemDoCatalogo } from "./catalogo";
import type { CatalogoItem } from "./types";

export interface ResultadoCompra {
  usuario: DemoUser;
  sucesso: boolean;
  erro?: string;
}

function comprarArmadura(usuario: DemoUser, item: CatalogoItem): DemoUser {
  const slot = item.slot;
  if (!slot) return usuario;
  const existente = usuario.armor.find((peca) => peca.slot === slot);
  // Comprar substitui a peça daquele slot (mantendo se já estava
  // equipada) — não há variantes/upgrades por slot no catálogo (o legado
  // também não tem mecanismo de upgrade, ver pesquisa de T-010), então
  // recomprar é a única forma de "trocar" o que ocupa um slot.
  const novaPeca: ArmorSlot = {
    slot,
    name: item.nome,
    equipped: existente?.equipped ?? false,
    rarity: item.raridade,
    level: 1,
    effect: item.effect,
    effectType: item.effectType,
  };
  const armor = existente
    ? usuario.armor.map((peca) => (peca.slot === slot ? novaPeca : peca))
    : [...usuario.armor, novaPeca];
  return { ...usuario, armor };
}

function comprarConsumivelOuPermanente(
  usuario: DemoUser,
  item: CatalogoItem,
): DemoUser {
  const existenteIdx = usuario.inventory.findIndex((i) => i.id === item.id);
  if (existenteIdx >= 0) {
    const inventory = usuario.inventory.map((i, idx) =>
      idx === existenteIdx ? { ...i, quantity: i.quantity + 1 } : i,
    );
    return { ...usuario, inventory };
  }
  const novoItem: InventoryItem = {
    id: item.id,
    name: item.nome,
    description: item.descricao,
    quantity: 1,
    type: item.tipo === "armadura" ? "permanente" : item.tipo,
    durationMinutes: item.duracaoMinutos,
  };
  return { ...usuario, inventory: [...usuario.inventory, novoItem] };
}

/**
 * Compra um item do catálogo — pura, não persiste nada (quem chama decide
 * como salvar o `usuario` resultante, ver `persistencia.ts`). Regras
 * portadas de `comprarItem`/`servicos/loja.js` do legado, com uma correção
 * deliberada: lá, comprar um item `permanente` que você já possui apenas
 * empilha a quantidade sem nenhum aviso (bug real encontrado na pesquisa de
 * T-010, não um comportamento desejável) — aqui isso é bloqueado com uma
 * mensagem clara, já que um permanente representa "você desbloqueou isto
 * pra sempre", não algo consumível que faz sentido possuir em quantidade.
 */
export function comprarItem(usuario: DemoUser, itemId: string): ResultadoCompra {
  const item = obterItemDoCatalogo(itemId);
  if (!item) {
    return { usuario, sucesso: false, erro: "Item não encontrado no catálogo." };
  }
  if (usuario.gold < item.precoOuro) {
    return { usuario, sucesso: false, erro: "Ouro insuficiente." };
  }
  if (item.tipo === "permanente" && usuario.inventory.some((i) => i.id === item.id)) {
    return { usuario, sucesso: false, erro: "Você já possui este item." };
  }

  const usuarioComDesconto: DemoUser = {
    ...usuario,
    gold: usuario.gold - item.precoOuro,
  };

  const usuarioFinal =
    item.tipo === "armadura"
      ? comprarArmadura(usuarioComDesconto, item)
      : comprarConsumivelOuPermanente(usuarioComDesconto, item);

  return { usuario: usuarioFinal, sucesso: true };
}
