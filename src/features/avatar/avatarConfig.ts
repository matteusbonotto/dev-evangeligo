import { CONFIG_AVATAR_PADRAO } from "./avatarUrl";
import type { AvatarConfig } from "./types";

/**
 * Persistência da configuração de avatar (T-033) em `localStorage` — não
 * existe coluna de avatar em `profiles` no Supabase ainda (mesma
 * limitação já registrada para marcações/progresso de leitura em
 * `IA/memory/project-memory.md`). Falha silenciosamente se `localStorage`
 * estiver indisponível, devolvendo sempre a configuração padrão.
 */
const STORAGE_KEY = "evangeligo:avatar:config";

export function obterConfigAvatar(): AvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return CONFIG_AVATAR_PADRAO;
    return {
      ...CONFIG_AVATAR_PADRAO,
      ...(JSON.parse(raw) as Partial<AvatarConfig>),
    };
  } catch {
    return CONFIG_AVATAR_PADRAO;
  }
}

export function salvarConfigAvatar(config: AvatarConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage indisponível — a personalização não persiste, mas a UI segue funcionando.
  }
}

/** `true` se o usuário já customizou o avatar ao menos uma vez (existe algo salvo). */
export function temAvatarCustomizado(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}
