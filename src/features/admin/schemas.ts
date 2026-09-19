import { z } from "zod";

/**
 * Schemas de domínio (Zod) do painel admin (T-015). Regras puras, sem
 * dependência de React/Supabase — ver `IA/docs/architecture.md`.
 */

export const appRoleSchema = z.enum(["user", "admin"]);
export type AppRole = z.infer<typeof appRoleSchema>;

export const usuarioAdminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().nullable(),
  nome: z.string(),
  sobrenome: z.string(),
  role: appRoleSchema,
  created_at: z.string(),
});
export type UsuarioAdmin = z.infer<typeof usuarioAdminSchema>;

export const raridadeSchema = z.enum(["comum", "raro", "epico", "lendario"]);

export const conquistaFormSchema = z.object({
  id: z
    .string()
    .min(1, "Informe um id.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  titulo: z.string().min(1, "Informe um título."),
  descricao: z.string().min(1, "Informe uma descrição."),
  raridade: raridadeSchema,
  reward_xp: z.number().int().min(0),
  reward_gold: z.number().int().min(0),
  ativo: z.boolean(),
});
export type ConquistaForm = z.infer<typeof conquistaFormSchema>;

export const conquistaCatalogoSchema = conquistaFormSchema.extend({
  created_at: z.string(),
  updated_at: z.string(),
});
export type ConquistaCatalogo = z.infer<typeof conquistaCatalogoSchema>;

export const tipoMissaoSchema = z.enum([
  "humana",
  "espiritual",
  "conhecimento",
  "tarefa",
  "casal",
  "colaborativa",
]);

export const cadenciaMissaoSchema = z.enum(["diaria", "semanal"]);

export const missaoFormSchema = z.object({
  id: z
    .string()
    .min(1, "Informe um id.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  tipo: tipoMissaoSchema,
  titulo: z.string().min(1, "Informe um título."),
  descricao: z.string().min(1, "Informe uma descrição."),
  cadencia: cadenciaMissaoSchema,
  meta: z.number().int().positive("A meta precisa ser maior que zero."),
  reward_xp: z.number().int().min(0),
  reward_gold: z.number().int().min(0),
  ativo: z.boolean(),
});
export type MissaoForm = z.infer<typeof missaoFormSchema>;

export const missaoCatalogoSchema = missaoFormSchema.extend({
  created_at: z.string(),
  updated_at: z.string(),
});
export type MissaoCatalogo = z.infer<typeof missaoCatalogoSchema>;
