import type { DemoUser } from "../authentication/demo/demoUser";
import {
  evaluateAchievements,
  toUnlockedAchievement,
  type AchievementContext,
} from "../gamification/domain/achievements";
import { contarPecasEquipadas, raridadeDoConjuntoCompleto } from "./bonus";
import { aplicarRecompensaAoUsuario } from "./progresso";

/**
 * Monta o snapshot que `evaluateAchievements` (catálogo já existente e
 * testado em `gamification/domain/achievements.ts`, nunca antes ligado a
 * dado de usuário de verdade) precisa pra avaliar condições. Os campos sem
 * fonte de dado real ainda (quizzes perfeitos, trilhas concluídas, missões
 * colaborativas) ficam em 0/{} — honesto: essas conquistas simplesmente não
 * disparam até aquelas features passarem a rastrear esses números de
 * verdade (gap pré-existente, não introduzido pelo T-010).
 */
export function montarContextoConquistas(usuario: DemoUser): AchievementContext {
  return {
    lessonsCompleted: usuario.completedLessons,
    quizzesCompleted: usuario.completedQuizzes,
    perfectQuizzes: 0,
    currentStreak: usuario.streakDays,
    bestStreak: usuario.bestStreak,
    level: usuario.level,
    armorEquippedCount: contarPecasEquipadas(usuario.armor),
    armorFullSetSameRarity: raridadeDoConjuntoCompleto(usuario.armor) !== null,
    tracksCompleted: 0,
    missionsCompletedByType: {},
  };
}

/**
 * Verifica o catálogo inteiro de conquistas contra o estado atual e
 * desbloqueia (+ credita XP/ouro via `aplicarRecompensaAoUsuario`) as que
 * acabaram de ser satisfeitas — chamar depois de qualquer mutação que possa
 * ter completado uma (hoje: equipar/desequipar armadura; outras condições
 * como sequência/nível também são pegas de graça se algum dia mudarem por
 * outro caminho). Idempotente: `evaluateAchievements` já filtra
 * `alreadyUnlockedIds`, então rodar de novo sem nada novo não duplica nada.
 */
export function verificarNovasConquistas(usuario: DemoUser): DemoUser {
  const ctx = montarContextoConquistas(usuario);
  const jaDesbloqueadasIds = usuario.achievements.map((a) => a.id);
  const novas = evaluateAchievements(ctx, jaDesbloqueadasIds);
  if (!novas.length) return usuario;

  const agora = new Date().toISOString().slice(0, 10);
  let atualizado = usuario;
  for (const definicao of novas) {
    atualizado = {
      ...atualizado,
      achievements: [
        ...atualizado.achievements,
        toUnlockedAchievement(definicao, agora),
      ],
    };
    atualizado = aplicarRecompensaAoUsuario(atualizado, definicao.reward);
  }
  return atualizado;
}
