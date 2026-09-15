import type { User } from "@supabase/supabase-js";
import { supabaseClient } from "../../infrastructure/supabase/client";
import { AULAS } from "../study/content";
import {
  getAchievementById,
  toUnlockedAchievement,
} from "../gamification/domain/achievements";
import { CATALOGO_ARMADURA, obterItemDoCatalogo } from "./catalogo";
import {
  demoUser,
  type ArmorSlot,
  type DemoUser,
  type InventoryItem,
} from "../authentication/demo/demoUser";
import { CONFIG_AVATAR_PADRAO, montarUrlAvatar } from "../avatar/avatarUrl";
import type { AvatarConfig } from "../avatar/types";
import {
  calcularEntradasVidaInterior,
  carregarVidaInteriorReal,
} from "../dashboard/vidaInterior";

/**
 * Ponte entre uma conta REAL do Supabase e o formato `DemoUser` que
 * `DashboardPage`/`rpg/*`/`gamification/*` já esperam (T-047/ADR-040).
 *
 * Antes desta ponte, NENHUMA conta real conseguia abrir o Dashboard — só o
 * modo demonstração (`signInDemo`, localStorage) populava `user`. Catálogos
 * (itens, armadura, conquistas) continuam estáticos em código, iguais pra
 * toda conta — só a POSSE por usuário mora nas tabelas `rpg_*`
 * (`supabase/migrations/20260914180000_rpg_estado_real.sql`).
 *
 * Trilhas/aulas/quizzes/corações ainda NÃO são reais para contas
 * autenticadas — ficam com valores honestos porém estáticos
 * (`totalLessons`/`totalQuizzes` vêm da contagem real de `AULAS`, mas
 * `completedLessons`/`completedQuizzes` ficam em 0) até uma próxima rodada
 * de banco de dados dedicada a estudo/progresso (ver ADR-040).
 *
 * `spiritBattle` (Vida Interior) VIROU real em T-059/ADR-051 — calculado a
 * partir de check-ins de verdade em `vida_interior_checkins`
 * (`dashboard/vidaInterior.ts`), janela móvel de 30 dias. Conta nova sem
 * nenhum check-in ainda mostra 0×0 em todo par (honesto — "sem dados
 * ainda"), nunca os números fixos da demo.
 */

const XP_PARA_PROXIMO_NIVEL_INICIAL = 500;
const OURO_INICIAL = 50;
/** Itens temáticos de graça pra toda conta nova — mesmos 4 "permanentes" que o modo demonstração já mostra. */
const ITENS_INICIAIS = [
  "item-biblia-estudo",
  "item-catecismo",
  "item-calvino",
  "item-harpa",
];

interface LinhaProgresso {
  level: number;
  xp: number;
  xp_to_next_level: number;
  gold: number;
  streak_days: number;
  best_streak: number;
}

export interface LinhaInventario {
  item_id: string;
  quantity: number;
}

export interface LinhaArmadura {
  slot: ArmorSlot["slot"];
  item_id: string;
  equipped: boolean;
  level: number;
}

export interface LinhaEfeito {
  item_id: string;
  nome: string;
  inicia_em: string;
  termina_em: string;
}

export interface LinhaConquista {
  achievement_id: string;
  unlocked_at: string;
}

async function criarEstadoInicial(userId: string): Promise<void> {
  if (!supabaseClient) return;
  await supabaseClient.from("rpg_progresso").insert({
    user_id: userId,
    level: 1,
    xp: 0,
    xp_to_next_level: XP_PARA_PROXIMO_NIVEL_INICIAL,
    gold: OURO_INICIAL,
  });
  await supabaseClient.from("rpg_inventario").insert(
    ITENS_INICIAIS.map((itemId) => ({
      user_id: userId,
      item_id: itemId,
      quantity: 1,
    })),
  );
}

export function montarInventario(
  linhas: LinhaInventario[],
  efeitos: LinhaEfeito[],
): InventoryItem[] {
  return linhas
    .map((linha): InventoryItem | null => {
      const catalogo = obterItemDoCatalogo(linha.item_id);
      if (!catalogo || catalogo.tipo === "armadura") return null;
      const efeitoAtivo = efeitos.find((e) => e.item_id === linha.item_id);
      return {
        id: linha.item_id,
        name: catalogo.nome,
        description: catalogo.descricao,
        quantity: linha.quantity,
        type: catalogo.tipo,
        durationMinutes: catalogo.duracaoMinutos,
        expiresAt: efeitoAtivo?.termina_em,
      };
    })
    .filter((item): item is InventoryItem => item !== null);
}

export function montarArmadura(linhas: LinhaArmadura[]): ArmorSlot[] {
  return linhas.map((linha) => {
    const catalogo = CATALOGO_ARMADURA.find((i) => i.slot === linha.slot);
    return {
      slot: linha.slot,
      name: catalogo?.nome ?? linha.item_id,
      equipped: linha.equipped,
      rarity: catalogo?.raridade ?? "comum",
      level: linha.level,
      effect: catalogo?.effect ?? "",
      effectType: catalogo?.effectType ?? "passivo",
    };
  });
}

export function montarConquistas(linhas: LinhaConquista[]) {
  return linhas
    .map((linha) => {
      const definicao = getAchievementById(linha.achievement_id);
      return definicao
        ? toUnlockedAchievement(definicao, linha.unlocked_at)
        : null;
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);
}

/**
 * Carrega o estado de RPG real de uma conta autenticada, criando as linhas
 * iniciais (`rpg_progresso` + itens de graça) na primeira vez que ela chega
 * aqui. Nunca lança — em caso de falha de rede, devolve um estado inicial
 * em memória (não persistido) pra não travar o Dashboard.
 */
export interface PerfilBasico {
  nome: string;
  sobrenome: string;
  /** `null` até a pessoa customizar o avatar pela 1ª vez (T-053/ADR-046). */
  avatar_config: AvatarConfig | null;
}

export async function carregarOuCriarEstadoReal(
  supabaseUser: User,
  perfil: PerfilBasico | null,
): Promise<DemoUser> {
  const nomeCompleto = perfil
    ? [perfil.nome, perfil.sobrenome].filter(Boolean).join(" ")
    : "";
  const nomeExibicao = nomeCompleto || supabaseUser.email || "Peregrino";
  const totalLessons = AULAS.length;
  const totalQuizzes = AULAS.filter((a) => a.quizId).length;

  const base: DemoUser = {
    ...demoUser,
    id: supabaseUser.id,
    name: nomeExibicao,
    email: supabaseUser.email ?? "",
    avatarInitial: nomeExibicao.charAt(0).toUpperCase() || "P",
    avatarConfig: perfil?.avatar_config ?? CONFIG_AVATAR_PADRAO,
    isDemo: false,
    level: 1,
    xp: 0,
    xpToNextLevel: XP_PARA_PROXIMO_NIVEL_INICIAL,
    gold: OURO_INICIAL,
    streakDays: 0,
    bestStreak: 0,
    achievements: [],
    inventory: [],
    armor: [],
    effects: [],
    completedLessons: 0,
    totalLessons,
    completedQuizzes: 0,
    totalQuizzes,
    hearts: 5,
    maxHearts: 5,
    // Honesto "sem dados ainda" (0×0 em todo par) até o fetch real abaixo
    // resolver — nunca os números fixos da demo (T-059/ADR-051).
    spiritBattle: calcularEntradasVidaInterior([]),
  };

  if (!supabaseClient) return base;

  try {
    const { data: progresso } = await supabaseClient
      .from("rpg_progresso")
      .select("level, xp, xp_to_next_level, gold, streak_days, best_streak")
      .eq("user_id", supabaseUser.id)
      .maybeSingle<LinhaProgresso>();

    if (!progresso) {
      await criarEstadoInicial(supabaseUser.id);
      return {
        ...base,
        inventory: montarInventario(
          ITENS_INICIAIS.map((itemId) => ({ item_id: itemId, quantity: 1 })),
          [],
        ),
      };
    }

    const [
      inventarioResp,
      armaduraResp,
      efeitosResp,
      conquistasResp,
      spiritBattle,
    ] = await Promise.all([
      supabaseClient
        .from("rpg_inventario")
        .select("item_id, quantity")
        .eq("user_id", supabaseUser.id),
      supabaseClient
        .from("rpg_armadura")
        .select("slot, item_id, equipped, level")
        .eq("user_id", supabaseUser.id),
      supabaseClient
        .from("rpg_efeitos_ativos")
        .select("item_id, nome, inicia_em, termina_em")
        .eq("user_id", supabaseUser.id)
        .gt("termina_em", new Date().toISOString()),
      supabaseClient
        .from("rpg_conquistas_usuario")
        .select("achievement_id, unlocked_at")
        .eq("user_id", supabaseUser.id),
      carregarVidaInteriorReal(supabaseUser.id),
    ]);

    const efeitos = (efeitosResp.data as LinhaEfeito[] | null) ?? [];

    return {
      ...base,
      level: progresso.level,
      xp: progresso.xp,
      xpToNextLevel: progresso.xp_to_next_level,
      gold: progresso.gold,
      streakDays: progresso.streak_days,
      bestStreak: progresso.best_streak,
      inventory: montarInventario(
        (inventarioResp.data as LinhaInventario[] | null) ?? [],
        efeitos,
      ),
      armor: montarArmadura(
        (armaduraResp.data as LinhaArmadura[] | null) ?? [],
      ),
      effects: efeitos.map((e) => ({
        itemId: e.item_id,
        nome: e.nome,
        iniciaEm: e.inicia_em,
        terminaEm: e.termina_em,
      })),
      achievements: montarConquistas(
        (conquistasResp.data as LinhaConquista[] | null) ?? [],
      ),
      spiritBattle,
    };
  } catch {
    return base;
  }
}

/**
 * Persiste uma mutação de RPG (compra/venda/equipar/usar item/XP/ouro) de
 * volta pro Supabase, chamada por `AuthContext.updateUser` quando a conta é
 * real (não demonstração). Estratégia "substituir tudo" pras tabelas de
 * posse (inventário/armadura/efeitos, no máximo ~9/6/3 linhas cada) — mais
 * simples e menos propensa a erro do que diffing fino, custo desprezível
 * nesse tamanho. Conquistas são append-only (só insere as novas). Falha de
 * rede aqui nunca deve quebrar a UI — o estado local otimista já foi
 * aplicado por quem chamou.
 */
export async function persistirEstadoRpgReal(
  userId: string,
  anterior: DemoUser | null,
  proximo: DemoUser,
): Promise<void> {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from("rpg_progresso").upsert({
      user_id: userId,
      level: proximo.level,
      xp: proximo.xp,
      xp_to_next_level: proximo.xpToNextLevel,
      gold: proximo.gold,
      streak_days: proximo.streakDays,
      best_streak: proximo.bestStreak,
    });

    // Avatar (T-053/ADR-046) — só grava de novo se realmente mudou, pra não
    // fazer um UPDATE de profiles a cada compra/equipar (que nunca mexe no
    // avatar).
    if (
      JSON.stringify(anterior?.avatarConfig) !==
      JSON.stringify(proximo.avatarConfig)
    ) {
      await supabaseClient
        .from("profiles")
        .update({
          avatar_config: proximo.avatarConfig,
          avatar_url: montarUrlAvatar(proximo.avatarConfig),
        })
        .eq("id", userId);
    }

    await supabaseClient.from("rpg_inventario").delete().eq("user_id", userId);
    if (proximo.inventory.length > 0) {
      await supabaseClient.from("rpg_inventario").insert(
        proximo.inventory.map((item) => ({
          user_id: userId,
          item_id: item.id,
          quantity: item.quantity,
        })),
      );
    }

    await supabaseClient.from("rpg_armadura").delete().eq("user_id", userId);
    if (proximo.armor.length > 0) {
      await supabaseClient.from("rpg_armadura").insert(
        proximo.armor.map((peca) => ({
          user_id: userId,
          slot: peca.slot,
          item_id:
            CATALOGO_ARMADURA.find((i) => i.slot === peca.slot)?.id ??
            peca.slot,
          equipped: peca.equipped,
          level: peca.level,
        })),
      );
    }

    await supabaseClient
      .from("rpg_efeitos_ativos")
      .delete()
      .eq("user_id", userId);
    if (proximo.effects.length > 0) {
      await supabaseClient.from("rpg_efeitos_ativos").insert(
        proximo.effects.map((efeito) => ({
          user_id: userId,
          item_id: efeito.itemId,
          nome: efeito.nome,
          inicia_em: efeito.iniciaEm,
          termina_em: efeito.terminaEm,
        })),
      );
    }

    const idsAntigos = new Set(
      (anterior?.achievements ?? []).map((a) => a.id),
    );
    const novasConquistas = proximo.achievements.filter(
      (a) => !idsAntigos.has(a.id),
    );
    if (novasConquistas.length > 0) {
      await supabaseClient.from("rpg_conquistas_usuario").insert(
        novasConquistas.map((a) => ({
          user_id: userId,
          achievement_id: a.id,
          unlocked_at: a.unlockedAt,
        })),
      );
    }
  } catch (erro) {
    // Estado local (otimista) já foi aplicado por quem chamou updateUser —
    // uma falha de rede aqui não pode travar a experiência, só fica sem
    // sincronizar até a próxima mutação bem-sucedida.
    console.error("Falha ao persistir estado de RPG real:", erro);
  }
}
