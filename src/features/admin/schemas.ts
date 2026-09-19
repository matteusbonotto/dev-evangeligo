import { z } from "zod";
import { bibleReferenceSchema } from "../study/schemas";
import { quizQuestionSchema } from "../study/quiz/schemas";

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

/**
 * Trilhas/Aulas/Quizzes ADICIONAIS (T-015/ADR-056) — as 5 trilhas/17 aulas/
 * 5 quizzes originais continuam estáticas em código, nunca editadas por
 * aqui. `bibleReferences`/`questions` são editados como JSON bruto no
 * formulário (não um editor visual por campo) — troca deliberada de
 * polimento de UI por viabilidade, dado o formato aninhado dessas listas;
 * a validação Zod aqui é o que garante que o JSON colado tem a forma certa
 * antes de salvar.
 */
export const trilhaFormSchema = z.object({
  id: z
    .string()
    .min(1, "Informe um id.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  slug: z
    .string()
    .min(1, "Informe um slug.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  order: z.number().int().positive(),
  title: z.string().min(1, "Informe um título."),
  description: z.string().min(1, "Informe uma descrição."),
  /** JSON de um BibleReference, ou string vazia para omitir. */
  verse_focus: z.string(),
  ativo: z.boolean(),
});
export type TrilhaForm = z.infer<typeof trilhaFormSchema>;

export const trilhaCatalogoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  verse_focus: bibleReferenceSchema.nullable(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TrilhaCatalogo = z.infer<typeof trilhaCatalogoSchema>;

export const aulaFormSchema = z.object({
  id: z
    .string()
    .min(1, "Informe um id.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  trilha_id: z.string().min(1, "Informe o id da trilha (estática ou do catálogo)."),
  order: z.number().int().positive(),
  title: z.string().min(1, "Informe um título."),
  summary: z.string().min(1, "Informe um resumo."),
  /** JSON de um array de BibleReference (mín. 2). */
  bible_references: z.string().min(1, "Informe ao menos 2 referências bíblicas, em JSON."),
  estimated_minutes: z.number().int().positive(),
  quiz_id: z.string(),
  ativo: z.boolean(),
});
export type AulaForm = z.infer<typeof aulaFormSchema>;

export const aulaCatalogoSchema = z.object({
  id: z.string(),
  trilha_id: z.string(),
  order: z.number(),
  title: z.string(),
  summary: z.string(),
  bible_references: z.array(bibleReferenceSchema),
  estimated_minutes: z.number(),
  quiz_id: z.string().nullable(),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AulaCatalogo = z.infer<typeof aulaCatalogoSchema>;

export const quizFormSchema = z.object({
  id: z
    .string()
    .min(1, "Informe um id.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífen."),
  aula_id: z.string(),
  title: z.string().min(1, "Informe um título."),
  /** JSON de um array de QuizQuestion (mín. 3), união por `type`. */
  questions: z.string().min(1, "Informe ao menos 3 perguntas, em JSON."),
  ativo: z.boolean(),
});
export type QuizForm = z.infer<typeof quizFormSchema>;

export const quizCatalogoSchema = z.object({
  id: z.string(),
  aula_id: z.string().nullable(),
  title: z.string(),
  questions: z.array(quizQuestionSchema),
  ativo: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type QuizCatalogo = z.infer<typeof quizCatalogoSchema>;
