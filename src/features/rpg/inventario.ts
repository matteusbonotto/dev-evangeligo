import type {
  ActiveEffect,
  ArmorSlot,
  DemoUser,
} from "../authentication/demo/demoUser";
import {
  CATALOGO_ARMADURA,
  calcularValorVenda,
  obterItemDoCatalogo,
} from "./catalogo";
import { temBonusDeOuroAoVender } from "./bonus";
import { verificarNovasConquistas } from "./conquistas";

export interface ResultadoAcao {
  usuario: DemoUser;
  sucesso: boolean;
  erro?: string;
}

/**
 * Máximo de efeitos de consumível ativos ao mesmo tempo — mesmo limite do
 * `configuracao_app.max_slots_efeitos` do legado (`usar_item` RPC,
 * `legacy/supabase/migrations/003_efeitos_ativos_e_recarga.sql`), portado
 * como constante fixa aqui já que não há uma tabela de configuração global
 * nesta fase (domínio puro + localStorage, sem backend próprio ainda).
 */
export const RPG_MAX_EFEITOS_ATIVOS = 3;

function efeitosAindaAtivos(effects: ActiveEffect[], agora: Date): ActiveEffect[] {
  return effects.filter((efeito) => new Date(efeito.terminaEm) > agora);
}

/**
 * Alterna equipar/desequipar uma peça de armadura pelo slot (não por id —
 * `ArmorSlot` não tem um `id` próprio porque só existe UMA peça possível
 * por slot neste modelo, diferente do legado onde várias peças de
 * inventário podiam competir pelo mesmo slot e precisavam de uma troca
 * explícita). Verifica conquistas em seguida (equipar a 6ª peça pode
 * desbloquear "Soldado de Cristo"/"Armadura Completa de Deus" na hora).
 */
export function alternarEquiparArmadura(
  usuario: DemoUser,
  slot: ArmorSlot["slot"],
): ResultadoAcao {
  const peca = usuario.armor.find((p) => p.slot === slot);
  if (!peca) {
    return { usuario, sucesso: false, erro: "Você ainda não possui esta peça." };
  }
  const armor = usuario.armor.map((p) =>
    p.slot === slot ? { ...p, equipped: !p.equipped } : p,
  );
  const atualizado = verificarNovasConquistas({ ...usuario, armor });
  return { usuario: atualizado, sucesso: true };
}

/** Vende uma peça de armadura equipada ou não — some do slot (fica disponível pra comprar de novo na loja). */
export function venderArmadura(
  usuario: DemoUser,
  slot: ArmorSlot["slot"],
): ResultadoAcao {
  const peca = usuario.armor.find((p) => p.slot === slot);
  if (!peca) {
    return { usuario, sucesso: false, erro: "Você não possui esta peça." };
  }
  const item = CATALOGO_ARMADURA.find((i) => i.slot === slot);
  const precoBase = item ? calcularValorVenda(item) : 0;
  const bonus = temBonusDeOuroAoVender(usuario.armor) ? Math.ceil(precoBase * 0.05) : 0;
  const usuarioSemPeca: DemoUser = {
    ...usuario,
    armor: usuario.armor.filter((p) => p.slot !== slot),
    gold: usuario.gold + precoBase + bonus,
  };
  return { usuario: usuarioSemPeca, sucesso: true };
}

/** Vende 1 unidade de um item de inventário (consumível ou permanente). */
export function venderItemInventario(
  usuario: DemoUser,
  itemId: string,
): ResultadoAcao {
  const linha = usuario.inventory.find((i) => i.id === itemId);
  if (!linha) {
    return { usuario, sucesso: false, erro: "Você não possui este item." };
  }
  const item = obterItemDoCatalogo(itemId);
  const precoBase = item ? calcularValorVenda(item) : 0;
  const bonus = temBonusDeOuroAoVender(usuario.armor) ? Math.ceil(precoBase * 0.05) : 0;
  const inventory =
    linha.quantity > 1
      ? usuario.inventory.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
        )
      : usuario.inventory.filter((i) => i.id !== itemId);
  return {
    usuario: { ...usuario, inventory, gold: usuario.gold + precoBase + bonus },
    sucesso: true,
  };
}

/**
 * Usa 1 unidade de um consumível: decrementa a quantidade (removendo a
 * linha se chegar a 0) e ativa o efeito por `duracaoMinutos`, respeitando o
 * limite de `RPG_MAX_EFEITOS_ATIVOS` efeitos simultâneos (efeitos já
 * expirados não contam pro limite — mesma regra de "slot livre" do
 * `usar_item` do legado, só que recalculada aqui em vez de checada via
 * `WHERE termina_em > now()` no Postgres).
 */
export function usarConsumivel(
  usuario: DemoUser,
  itemId: string,
  agora: Date = new Date(),
): ResultadoAcao {
  const linha = usuario.inventory.find((i) => i.id === itemId);
  if (!linha || linha.type !== "consumivel") {
    return { usuario, sucesso: false, erro: "Este item não pode ser usado assim." };
  }
  if (linha.quantity < 1) {
    return { usuario, sucesso: false, erro: "Você não possui mais unidades deste item." };
  }
  const item = obterItemDoCatalogo(itemId);
  const duracaoMinutos = item?.duracaoMinutos ?? linha.durationMinutes;
  if (!duracaoMinutos) {
    return { usuario, sucesso: false, erro: "Item consumível sem duração configurada." };
  }

  const ativos = efeitosAindaAtivos(usuario.effects, agora);
  if (ativos.length >= RPG_MAX_EFEITOS_ATIVOS) {
    return {
      usuario,
      sucesso: false,
      erro: "Todos os slots de efeito estão ocupados. Aguarde um terminar.",
    };
  }

  const novoEfeito: ActiveEffect = {
    itemId,
    nome: linha.name,
    iniciaEm: agora.toISOString(),
    terminaEm: new Date(agora.getTime() + duracaoMinutos * 60_000).toISOString(),
  };

  const inventory =
    linha.quantity > 1
      ? usuario.inventory.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
        )
      : usuario.inventory.filter((i) => i.id !== itemId);

  return {
    usuario: { ...usuario, inventory, effects: [...ativos, novoEfeito] },
    sucesso: true,
  };
}
