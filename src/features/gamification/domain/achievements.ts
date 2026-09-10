import type { MissionType, Rarity, Reward } from "./types";

/**
 * Catálogo de conquistas (RF-14) — TypeScript puro, sem dependência de
 * React/Supabase. Cada conquista é avaliada por uma função `condition`
 * pura sobre um snapshot (`AchievementContext`) que a camada de aplicação
 * monta a partir de dados reais (aulas, quizzes, sequência, missões,
 * armadura, trilhas). Este módulo não sabe de onde vêm esses números —
 * apenas decide, dado o snapshot, quais conquistas foram satisfeitas.
 *
 * Conjunto representativo cobrindo as 4 raridades (comum/raro/épico/
 * lendário, mesma taxonomia de `ARMOR_SET_BONUSES` em
 * `src/features/dashboard/armorSlots.ts`) e várias categorias de progresso
 * (aulas, quizzes, sequência, armadura, missões, trilhas, nível). A
 * migração completa dos ~23 modelos do legado fica para trabalho futuro —
 * ver nota de escopo no relatório da tarefa T-009.
 */

export interface AchievementContext {
  lessonsCompleted: number;
  quizzesCompleted: number;
  /** Quizzes concluídos sem nenhum erro. */
  perfectQuizzes: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  /** Quantidade de peças de armadura equipadas (0-6). */
  armorEquippedCount: number;
  /** `true` se as 6 peças estiverem equipadas e forem da mesma raridade. */
  armorFullSetSameRarity: boolean;
  tracksCompleted: number;
  missionsCompletedByType: Partial<Record<MissionType, number>>;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  reward: Reward;
  condition: (ctx: AchievementContext) => boolean;
}

/**
 * Forma final exibida ao usuário depois de desbloqueada — compatível em
 * formato com `Achievement` de `DemoUser`
 * (`src/features/authentication/demo/demoUser.ts`): `id`, `title`,
 * `description`, `rarity`, `unlockedAt`.
 */
export interface UnlockedAchievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  unlockedAt: string;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // comum — onboarding, alcançável nos primeiros minutos de uso.
  {
    id: "primeiro-passo",
    title: "Primeiro Passo",
    description: "Concluiu sua primeira aula.",
    rarity: "comum",
    reward: { xp: 10, gold: 5 },
    condition: (ctx) => ctx.lessonsCompleted >= 1,
  },
  {
    id: "primeira-sequencia",
    title: "Constância Inicial",
    description: "Manteve uma sequência de 3 dias.",
    rarity: "comum",
    reward: { xp: 15, gold: 10 },
    condition: (ctx) => ctx.currentStreak >= 3,
  },
  {
    id: "primeiro-quiz",
    title: "Primeira Prova",
    description: "Concluiu seu primeiro quiz.",
    rarity: "comum",
    reward: { xp: 10, gold: 5 },
    condition: (ctx) => ctx.quizzesCompleted >= 1,
  },
  // raro
  {
    id: "constancia",
    title: "Constância",
    description: "Manteve uma sequência de 7 dias.",
    rarity: "raro",
    reward: { xp: 50, gold: 30 },
    condition: (ctx) => ctx.bestStreak >= 7,
  },
  {
    id: "estudioso",
    title: "Estudioso",
    description: "Concluiu 10 aulas.",
    rarity: "raro",
    reward: { xp: 60, gold: 40 },
    condition: (ctx) => ctx.lessonsCompleted >= 10,
  },
  {
    id: "acertador",
    title: "Acertador",
    description: "Concluiu 5 quizzes sem errar.",
    rarity: "raro",
    reward: { xp: 60, gold: 40 },
    condition: (ctx) => ctx.perfectQuizzes >= 5,
  },
  {
    id: "em-ascensao",
    title: "Em Ascensão",
    description: "Alcançou o nível 10.",
    rarity: "raro",
    reward: { xp: 80, gold: 50 },
    condition: (ctx) => ctx.level >= 10,
  },
  // epico
  {
    id: "soldado-de-cristo",
    title: "Soldado de Cristo",
    description: "Equipou as 6 peças da Armadura de Deus.",
    rarity: "epico",
    reward: { xp: 150, gold: 100 },
    condition: (ctx) => ctx.armorEquippedCount >= 6,
  },
  {
    id: "mestre-dos-quizzes",
    title: "Mestre dos Quizzes",
    description: "Concluiu 20 quizzes sem errar.",
    rarity: "epico",
    reward: { xp: 150, gold: 100 },
    condition: (ctx) => ctx.perfectQuizzes >= 20,
  },
  {
    id: "guerreiro-fiel",
    title: "Guerreiro Fiel",
    description: "Manteve uma sequência de 30 dias.",
    rarity: "epico",
    reward: { xp: 150, gold: 100 },
    condition: (ctx) => ctx.bestStreak >= 30,
  },
  {
    id: "maos-que-servem",
    title: "Mãos que Servem",
    description: "Concluiu 5 missões colaborativas.",
    rarity: "epico",
    reward: { xp: 150, gold: 100 },
    condition: (ctx) => (ctx.missionsCompletedByType.colaborativa ?? 0) >= 5,
  },
  {
    id: "trilha-concluida",
    title: "Trilha Concluída",
    description: "Concluiu sua primeira trilha de estudo.",
    rarity: "epico",
    reward: { xp: 120, gold: 80 },
    condition: (ctx) => ctx.tracksCompleted >= 1,
  },
  // lendario
  {
    id: "armadura-completa",
    title: "Armadura Completa de Deus",
    description: "Equipou as 6 peças da mesma raridade.",
    rarity: "lendario",
    reward: { xp: 400, gold: 250 },
    condition: (ctx) => ctx.armorFullSetSameRarity,
  },
  {
    id: "centuriao-da-fe",
    title: "Centurião da Fé",
    description: "Manteve uma sequência de 100 dias.",
    rarity: "lendario",
    reward: { xp: 500, gold: 300 },
    condition: (ctx) => ctx.bestStreak >= 100,
  },
  {
    id: "teologo-reformado",
    title: "Teólogo Reformado",
    description: "Concluiu as 5 trilhas de estudo.",
    rarity: "lendario",
    reward: { xp: 500, gold: 300 },
    condition: (ctx) => ctx.tracksCompleted >= 5,
  },
  {
    id: "mestre-da-fe",
    title: "Mestre da Fé",
    description: "Alcançou o nível 30.",
    rarity: "lendario",
    reward: { xp: 600, gold: 400 },
    condition: (ctx) => ctx.level >= 30,
  },
];

/**
 * Retorna as conquistas cuja condição é satisfeita pelo snapshot e que
 * ainda não estão em `alreadyUnlockedIds`. Pura e determinística — não
 * muta nada, apenas informa o que DEVERIA ser desbloqueado agora.
 */
export function evaluateAchievements(
  ctx: AchievementContext,
  alreadyUnlockedIds: readonly string[],
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(
    (definition) =>
      !alreadyUnlockedIds.includes(definition.id) && definition.condition(ctx),
  );
}

export function getAchievementById(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((definition) => definition.id === id);
}

/** Converte uma definição do catálogo, já desbloqueada, para o formato exibido na UI. */
export function toUnlockedAchievement(
  definition: AchievementDefinition,
  unlockedAt: string,
): UnlockedAchievement {
  return {
    id: definition.id,
    title: definition.title,
    description: definition.description,
    rarity: definition.rarity,
    unlockedAt,
  };
}
