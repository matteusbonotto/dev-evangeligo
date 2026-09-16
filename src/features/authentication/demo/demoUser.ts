import { CONFIG_AVATAR_PADRAO } from "../../avatar/avatarUrl";
import type { AvatarConfig } from "../../avatar/types";
import {
  PARES_VIDA_INTERIOR,
  type TermoObra,
} from "../../dashboard/data/paresVidaInterior";

export type Rarity = "comum" | "raro" | "epico" | "lendario";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  unlockedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  type: "permanente" | "consumivel" | "armadura";
  /** Duração do efeito em minutos (apenas consumíveis temporários). */
  durationMinutes?: number;
  /** Timestamp ISO de quando o efeito ativo expira (se ativo). */
  expiresAt?: string;
}

export type EffectType = "passivo" | "reativo";

/**
 * Par Fruto do Espírito × Obra da Carne (Gálatas 5:16-23). As 9 obras da
 * carne são um agrupamento didático das ~17 citadas no texto, para que o
 * jogador tenha a mesma quantidade de itens dos dois lados e possa comparar
 * um a um. Pareamento por contraste (ex.: longanimidade × ira) valida a
 * intenção teológica de "Andai em Espírito, e não haveis de cumprir a
 * concupiscência da carne" (Gl 5:16), não uma equivalência literal do texto.
 */
export interface SpiritBattleEntry {
  id: string;
  fruitLabel: string;
  fruitValue: number;
  fleshLabel: string;
  fleshValue: number;
  /** O que o par significa e por que fruto e obra se opõem (Gl 5:16-23) — pedido do usuário: "mostrando o significado". */
  explicacao: string;
  /** Uma situação comum do dia a dia em que o contraste aparece na prática — pedido do usuário: "mostrando um exemplo do dia a dia". */
  exemploDoDia: string;
  /** Campos ricos do guia unificado (T-065/T-066) — ver `paresVidaInterior.ts`. */
  versiculo: string;
  significadoFruto: string;
  exemploFruto: string;
  pratica: string;
  pergunta: string;
  oracao: string;
  obraTermos: TermoObra[];
  sinalObra: string;
  respostaObra: string;
}

export interface ArmorSlot {
  slot: "cinto" | "couraca" | "calçados" | "escudo" | "capacete" | "espada";
  name: string;
  equipped: boolean;
  rarity: Rarity;
  level: number;
  effect: string;
  effectType: EffectType;
}

/** Um efeito de consumível em andamento — ver `src/features/rpg/types.ts` (`EfeitoAtivo`, mesmo formato). */
export interface ActiveEffect {
  itemId: string;
  nome: string;
  iniciaEm: string;
  terminaEm: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  /** Configuração do avatar ilustrado (T-053/ADR-046) — mesmo formato usado pelo editor (`avatar/types.ts`). */
  avatarConfig: AvatarConfig;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  streakDays: number;
  bestStreak: number;
  isDemo: boolean;
  achievements: Achievement[];
  inventory: InventoryItem[];
  armor: ArmorSlot[];
  /** Consumíveis em uso agora (T-010) — no máximo `RPG_MAX_EFEITOS_ATIVOS` simultâneos, ver `src/features/rpg/inventario.ts`. */
  effects: ActiveEffect[];
  completedLessons: number;
  totalLessons: number;
  completedQuizzes: number;
  totalQuizzes: number;
  hearts: number;
  maxHearts: number;
  spiritBattle: SpiritBattleEntry[];
}

/** Contagens fixas só pra ilustrar o recurso no modo demonstração — conta real usa check-ins de verdade (`dashboard/vidaInterior.ts`). */
const VALORES_DEMO_VIDA_INTERIOR: Record<
  string,
  { fruitValue: number; fleshValue: number }
> = {
  amor: { fruitValue: 78, fleshValue: 22 },
  alegria: { fruitValue: 70, fleshValue: 18 },
  paz: { fruitValue: 74, fleshValue: 20 },
  longanimidade: { fruitValue: 60, fleshValue: 30 },
  benignidade: { fruitValue: 68, fleshValue: 25 },
  bondade: { fruitValue: 72, fleshValue: 15 },
  fidelidade: { fruitValue: 80, fleshValue: 10 },
  mansidao: { fruitValue: 64, fleshValue: 12 },
  "dominio-proprio": { fruitValue: 58, fleshValue: 28 },
};

export const demoUser: DemoUser = {
  id: "demo-user",
  name: "Visitante",
  email: "demo@evangeligo.app",
  avatarInitial: "V",
  avatarConfig: CONFIG_AVATAR_PADRAO,
  level: 7,
  xp: 1240,
  xpToNextLevel: 1500,
  gold: 320,
  streakDays: 12,
  bestStreak: 21,
  isDemo: true,
  achievements: [
    {
      // Id igual ao do catálogo real (`gamification/domain/achievements.ts`,
      // "primeiro-passo") — antes desse catálogo existir/ser ligado a este
      // usuário (T-010), este registro usava um id ad hoc ("ach-primeiro-
      // passo") que nunca batia com o do motor de conquistas de verdade.
      // Sem alinhar, `verificarNovasConquistas` (que só evita duplicar pelo
      // id) desbloqueava "Primeiro Passo" de novo, duplicado, na primeira
      // vez que qualquer condição fosse checada — bug real pego ao
      // verificar o fluxo completo em navegador real.
      id: "primeiro-passo",
      title: "Primeiro Passo",
      description: "Concluiu sua primeira aula.",
      rarity: "comum",
      unlockedAt: "2026-08-01",
    },
    {
      // Mesmo motivo do comentário acima — "constancia" é o id real do
      // catálogo pra esta conquista ("Manteve uma sequência de 7 dias.").
      id: "constancia",
      title: "Constância",
      description: "Manteve uma sequência de 7 dias.",
      rarity: "raro",
      unlockedAt: "2026-08-08",
    },
    {
      id: "ach-sola-scriptura",
      title: "Sola Scriptura",
      description: "Concluiu a trilha das Cinco Solas.",
      rarity: "lendario",
      unlockedAt: "2026-08-15",
    },
  ],
  inventory: [
    {
      id: "item-biblia-estudo",
      name: "Bíblia de Estudo",
      description: "Referência permanente das Escrituras.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-catecismo",
      name: "Catecismo de Heidelberg",
      description: "Referência permanente de doutrina.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-calvino",
      name: "Comentário de Calvino",
      description: "Referência permanente de exegese.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-harpa",
      name: "Harpa Cristã",
      description: "Referência permanente de hinos.",
      quantity: 1,
      type: "permanente",
    },
    {
      id: "item-protecao-fe",
      name: "Proteção da Fé",
      description: "Protege 20% dos corações em um quiz.",
      quantity: 3,
      type: "consumivel",
      durationMinutes: 30,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
    {
      id: "item-coracao",
      name: "Coração Extra",
      description: "Recupera um coração perdido.",
      quantity: 2,
      type: "consumivel",
    },
    {
      id: "item-foco",
      name: "Poção de Foco",
      description: "Ganha +XP em quizzes.",
      quantity: 2,
      type: "consumivel",
      durationMinutes: 20,
    },
    {
      id: "item-tocha",
      name: "Tocha da Verdade",
      description: "Revela uma dica em um quiz.",
      quantity: 1,
      type: "consumivel",
      durationMinutes: 15,
    },
    {
      id: "item-pao",
      name: "Pão da Vida",
      description: "Recupera energia para continuar.",
      quantity: 4,
      type: "consumivel",
      durationMinutes: 25,
    },
  ],
  armor: [
    {
      slot: "cinto",
      name: "Cinto da Verdade",
      equipped: true,
      rarity: "comum",
      level: 1,
      effect: "+5% de ouro",
      effectType: "passivo",
    },
    {
      slot: "couraca",
      name: "Couraça da Justiça",
      equipped: true,
      rarity: "lendario",
      level: 3,
      effect: "Reduz dano de coração em 30%",
      effectType: "passivo",
    },
    {
      slot: "calçados",
      name: "Calçados do Evangelho",
      equipped: false,
      rarity: "raro",
      level: 1,
      effect: "Sequência não quebra em 1 dia de folga",
      effectType: "passivo",
    },
    {
      slot: "escudo",
      name: "Escudo da Fé",
      equipped: true,
      rarity: "raro",
      level: 2,
      effect: "Bloqueia 1 erro por quiz",
      effectType: "reativo",
    },
    {
      slot: "capacete",
      name: "Capacete da Salvação",
      equipped: true,
      rarity: "epico",
      level: 2,
      effect: "+10% de XP em aulas",
      effectType: "passivo",
    },
    {
      slot: "espada",
      name: "Espada do Espírito",
      equipped: true,
      rarity: "lendario",
      level: 4,
      effect: "A cada 3 acertos, +1 coração",
      effectType: "reativo",
    },
  ],
  effects: [],
  completedLessons: 9,
  totalLessons: 17,
  completedQuizzes: 12,
  totalQuizzes: 35,
  hearts: 5,
  maxHearts: 5,
  // Valores fixos da conta demonstração (Fase 5/T-059/ADR-051) — a
  // metadata dos 9 pares (rótulos/explicação/exemplo) mora em
  // `dashboard/data/paresVidaInterior.ts`, única fonte compartilhada com o
  // cálculo REAL de conta autenticada (`dashboard/vidaInterior.ts`).
  spiritBattle: PARES_VIDA_INTERIOR.map((par) => ({
    ...par,
    ...VALORES_DEMO_VIDA_INTERIOR[par.id],
  })),
};
