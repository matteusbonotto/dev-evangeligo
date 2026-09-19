import type { DemoUser } from "../authentication/demo/demoUser";
import { CONFIG_AVATAR_PADRAO } from "../avatar/avatarUrl";

/**
 * Fábrica de um `DemoUser` mínimo pros testes do RPG — deliberadamente SEM
 * nenhuma armadura/inventário/conquista pré-existente (diferente do
 * `demoUser` de produção, que já vem com um personagem "avançado"), pra
 * cada teste começar de um estado limpo e previsível.
 */
export function criarUsuarioDeTeste(overrides: Partial<DemoUser> = {}): DemoUser {
  return {
    id: "user-teste",
    name: "Teste",
    email: "teste@evangeligo.app",
    avatarInitial: "T",
    avatarConfig: CONFIG_AVATAR_PADRAO,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    gold: 100,
    streakDays: 0,
    bestStreak: 0,
    isDemo: true,
    achievements: [],
    inventory: [],
    armor: [],
    effects: [],
    completedLessons: 0,
    totalLessons: 17,
    completedQuizzes: 0,
    totalQuizzes: 35,
    hearts: 5,
    maxHearts: 5,
    spiritBattle: [],
    role: "user",
    ...overrides,
  };
}
