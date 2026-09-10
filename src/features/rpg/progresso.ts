import type { DemoUser } from "../authentication/demo/demoUser";
import { getXpProgress, totalXpForLevel } from "../gamification/domain/xpCurve";
import type { Reward } from "../gamification/domain/types";

/**
 * Aplica uma recompensa (XP/ouro/corações) a um `DemoUser`, reconciliando
 * XP/nível pela curva real (`xpCurve.ts`) em vez de somar direto em
 * `usuario.xp` — `DemoUser.xp`/`xpToNextLevel` guardam só o progresso
 * DENTRO do nível atual (não o total acumulado), então somar a recompensa
 * ali direto poderia passar de `xpToNextLevel` sem nunca subir de nível
 * (barra de progresso "estourando" visualmente). Reconstrói o total
 * (`totalXpForLevel(nível) + xp`), soma, e deriva nível/xp/xpToNextLevel de
 * volta com `getXpProgress` — mesmo motor já usado por
 * `gamification/domain/userProgress.ts`, só que aplicado à forma "achatada"
 * que a UI (`DemoUser`) usa hoje, sem migrar toda a UI pra `UserProgressState`
 * agora (fora do escopo do T-010).
 */
export function aplicarRecompensaAoUsuario(
  usuario: DemoUser,
  reward: Reward,
): DemoUser {
  const totalXpAtual = totalXpForLevel(usuario.level) + usuario.xp;
  const progresso = getXpProgress(Math.max(0, totalXpAtual + reward.xp));
  return {
    ...usuario,
    level: progresso.level,
    xp: progresso.xpIntoLevel,
    xpToNextLevel: progresso.xpForCurrentLevel,
    gold: Math.max(0, usuario.gold + reward.gold),
    hearts: reward.hearts
      ? Math.min(usuario.maxHearts, usuario.hearts + reward.hearts)
      : usuario.hearts,
  };
}
