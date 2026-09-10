import type { MissionType, Reward } from "./types";

/**
 * Modelos de missão (RF-15) — 6 tipos herdados do legado: humana,
 * espiritual, conhecimento, tarefa, casal, colaborativa (ver
 * `IA/agents/gamificacao.md`). Conjunto representativo (2-3 modelos por
 * tipo); a migração completa dos 23 modelos do legado fica para trabalho
 * futuro — ver nota de escopo no relatório da tarefa T-009.
 *
 * Cadência `diaria`/`semanal` apenas — deliberadamente SEM contagem
 * regressiva nem timer de urgência embutido no modelo de domínio (regra
 * 23: evitar pressão artificial). A camada de apresentação pode exibir um
 * prazo, mas o domínio não modela nenhuma penalidade por não concluir a
 * tempo — uma missão não concluída simplesmente não gera recompensa,
 * nunca subtrai XP/ouro/corações.
 */

export type MissionCadence = "diaria" | "semanal";

export interface MissionTemplate {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  cadence: MissionCadence;
  targetCount: number;
  reward: Reward;
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  // humana — gestos concretos de bondade no mundo real.
  {
    id: "humana-gesto-gentileza",
    type: "humana",
    title: "Gesto de Gentileza",
    description: "Faça algo gentil por alguém hoje.",
    cadence: "diaria",
    targetCount: 1,
    reward: { xp: 20, gold: 15 },
  },
  {
    id: "humana-ajuda-proximo",
    type: "humana",
    title: "Ajude o Próximo",
    description: "Ajude alguém 3 vezes esta semana.",
    cadence: "semanal",
    targetCount: 3,
    reward: { xp: 60, gold: 40 },
  },
  // espiritual — oração e reflexão.
  {
    id: "espiritual-momento-oracao",
    type: "espiritual",
    title: "Momento de Oração",
    description: "Dedique um momento de oração hoje.",
    cadence: "diaria",
    targetCount: 1,
    reward: { xp: 15, gold: 10 },
  },
  {
    id: "espiritual-reflexao-semanal",
    type: "espiritual",
    title: "Reflexão Semanal",
    description: "Reserve um tempo de reflexão nesta semana.",
    cadence: "semanal",
    targetCount: 1,
    reward: { xp: 50, gold: 30 },
  },
  // conhecimento — estudo do conteúdo do app (aulas/quizzes).
  {
    id: "conhecimento-licao-do-dia",
    type: "conhecimento",
    title: "Lição do Dia",
    description: "Conclua 1 aula hoje.",
    cadence: "diaria",
    targetCount: 1,
    reward: { xp: 25, gold: 15 },
  },
  {
    id: "conhecimento-maratona-estudo",
    type: "conhecimento",
    title: "Maratona de Estudo",
    description: "Conclua 5 aulas nesta semana.",
    cadence: "semanal",
    targetCount: 5,
    reward: { xp: 100, gold: 60 },
  },
  {
    id: "conhecimento-prova-perfeita",
    type: "conhecimento",
    title: "Prova Perfeita",
    description: "Conclua 1 quiz sem errar nesta semana.",
    cadence: "semanal",
    targetCount: 1,
    reward: { xp: 60, gold: 40 },
  },
  // tarefa — engajamento geral com o conteúdo do app.
  {
    id: "tarefa-leitura-biblica",
    type: "tarefa",
    title: "Leitura Bíblica",
    description: "Leia um trecho da Bíblia hoje.",
    cadence: "diaria",
    targetCount: 1,
    reward: { xp: 20, gold: 10 },
  },
  {
    id: "tarefa-guardar-palavra",
    type: "tarefa",
    title: "Guardar a Palavra",
    description: "Marque 3 versículos nesta semana.",
    cadence: "semanal",
    targetCount: 3,
    reward: { xp: 45, gold: 30 },
  },
  // casal — atividades para o usuário fazer com o cônjuge/parceiro(a).
  {
    id: "casal-devocional-a-dois",
    type: "casal",
    title: "Devocional a Dois",
    description: "Façam um devocional juntos nesta semana.",
    cadence: "semanal",
    targetCount: 1,
    reward: { xp: 70, gold: 50 },
  },
  {
    id: "casal-oracao-conjunta",
    type: "casal",
    title: "Oração em Conjunto",
    description: "Orem juntos hoje.",
    cadence: "diaria",
    targetCount: 1,
    reward: { xp: 25, gold: 15 },
  },
  // colaborativa — envolve outros usuários/amigos.
  {
    id: "colaborativa-chame-um-amigo",
    type: "colaborativa",
    title: "Chame um Amigo",
    description: "Convide 1 amigo para o EvangeliGO nesta semana.",
    cadence: "semanal",
    targetCount: 1,
    reward: { xp: 80, gold: 60 },
  },
  {
    id: "colaborativa-desafio-em-grupo",
    type: "colaborativa",
    title: "Desafio em Grupo",
    description: "Complete 5 atividades em grupo nesta semana.",
    cadence: "semanal",
    targetCount: 5,
    reward: { xp: 120, gold: 80 },
  },
];

export function getMissionTemplateById(
  id: string,
): MissionTemplate | undefined {
  return MISSION_TEMPLATES.find((template) => template.id === id);
}

export function getMissionTemplatesByType(
  type: MissionType,
): MissionTemplate[] {
  return MISSION_TEMPLATES.filter((template) => template.type === type);
}

export interface MissionProgress {
  templateId: string;
  currentCount: number;
  /** Data (YYYY-MM-DD) em que a meta foi atingida, ou `null` se ainda em andamento. */
  completedAt: string | null;
  /** Data (YYYY-MM-DD) em que a recompensa foi resgatada, ou `null` se ainda não resgatada. */
  claimedAt: string | null;
}

export function createMissionProgress(templateId: string): MissionProgress {
  return {
    templateId,
    currentCount: 0,
    completedAt: null,
    claimedAt: null,
  };
}

/**
 * Avança o progresso de uma missão em `amount` (padrão 1). Idempotente
 * após a conclusão: chamadas extras não alteram nada, nunca ultrapassa
 * `targetCount` nem "desconclui" uma missão já concluída.
 */
export function advanceMissionProgress(
  progress: MissionProgress,
  template: MissionTemplate,
  today: string,
  amount = 1,
): MissionProgress {
  assertMatchingTemplate(progress, template);
  if (progress.completedAt !== null) {
    return progress;
  }
  const currentCount = Math.min(
    template.targetCount,
    progress.currentCount + amount,
  );
  const completedAt = currentCount >= template.targetCount ? today : null;
  return { ...progress, currentCount, completedAt };
}

export function isMissionComplete(progress: MissionProgress): boolean {
  return progress.completedAt !== null;
}

/**
 * Resgata a recompensa (XP/ouro/itens) de uma missão concluída. Lança erro
 * se a missão ainda não foi concluída ou se a recompensa já foi
 * resgatada — evita conceder a mesma recompensa duas vezes, um bug comum
 * em economias de jogo.
 */
export function claimMissionReward(
  progress: MissionProgress,
  template: MissionTemplate,
  today: string,
): { progress: MissionProgress; reward: Reward } {
  assertMatchingTemplate(progress, template);
  if (progress.completedAt === null) {
    throw new Error(
      `Missão "${template.id}" ainda não foi concluída — não é possível resgatar recompensa.`,
    );
  }
  if (progress.claimedAt !== null) {
    throw new Error(`Recompensa da missão "${template.id}" já foi resgatada.`);
  }
  return {
    progress: { ...progress, claimedAt: today },
    reward: template.reward,
  };
}

function assertMatchingTemplate(
  progress: MissionProgress,
  template: MissionTemplate,
): void {
  if (progress.templateId !== template.id) {
    throw new Error(
      `Progresso (${progress.templateId}) não corresponde ao modelo de missão (${template.id}).`,
    );
  }
}
