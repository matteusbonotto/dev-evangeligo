import { supabaseClient } from "../../infrastructure/supabase/client";
import { bibleReferenceSchema } from "./schemas";
import { quizQuestionSchema } from "./quiz/schemas";
import { z } from "zod";

/**
 * Leitura pública do conteúdo ADICIONAL de trilhas/aulas/quizzes (T-015/
 * ADR-056) — tabelas `trilhas_catalogo`/`aulas_catalogo`/`quizzes_catalogo`,
 * RLS de leitura liberada pra qualquer usuário (`authenticated`/`anon`),
 * escrita só admin (ver migration `admin_conteudo_estudo`). Fica em
 * `study/`, não em `features/admin/`, porque quem CONSOME este catálogo é
 * `TrilhasPage`/`AulaPage`/`QuizPage` (regra 8: cada feature agrupa o que
 * usa) — o painel admin só reaproveita estas mesmas funções de leitura,
 * suas próprias funções de escrita ficam em `features/admin/adminApi.ts`.
 *
 * Nunca lança: se o Supabase não estiver configurado (modo demonstração)
 * ou a rede falhar, devolve lista vazia — o app continua funcionando só
 * com o conteúdo estático, que é a experiência de sempre.
 */

const trilhaCatalogoLeituraSchema = z.object({
  id: z.string(),
  slug: z.string(),
  order: z.number(),
  title: z.string(),
  description: z.string(),
  verse_focus: bibleReferenceSchema.nullable(),
  ativo: z.boolean(),
});
export type TrilhaCatalogoLeitura = z.infer<typeof trilhaCatalogoLeituraSchema>;

const aulaCatalogoLeituraSchema = z.object({
  id: z.string(),
  trilha_id: z.string(),
  order: z.number(),
  title: z.string(),
  summary: z.string(),
  bible_references: z.array(bibleReferenceSchema),
  estimated_minutes: z.number(),
  quiz_id: z.string().nullable(),
  ativo: z.boolean(),
});
export type AulaCatalogoLeitura = z.infer<typeof aulaCatalogoLeituraSchema>;

const quizCatalogoLeituraSchema = z.object({
  id: z.string(),
  aula_id: z.string().nullable(),
  title: z.string(),
  questions: z.array(quizQuestionSchema),
  ativo: z.boolean(),
});
export type QuizCatalogoLeitura = z.infer<typeof quizCatalogoLeituraSchema>;

export async function listarTrilhasAdicionais(): Promise<TrilhaCatalogoLeitura[]> {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from("trilhas_catalogo")
      .select("id, slug, order, title, description, verse_focus, ativo")
      .eq("ativo", true)
      .order("order", { ascending: true });
    if (error || !data) return [];
    return z.array(trilhaCatalogoLeituraSchema).parse(data);
  } catch {
    return [];
  }
}

export async function listarAulasAdicionais(): Promise<AulaCatalogoLeitura[]> {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from("aulas_catalogo")
      .select("id, trilha_id, order, title, summary, bible_references, estimated_minutes, quiz_id, ativo")
      .eq("ativo", true)
      .order("order", { ascending: true });
    if (error || !data) return [];
    return z.array(aulaCatalogoLeituraSchema).parse(data);
  } catch {
    return [];
  }
}

export async function listarQuizzesAdicionais(): Promise<QuizCatalogoLeitura[]> {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from("quizzes_catalogo")
      .select("id, aula_id, title, questions, ativo")
      .eq("ativo", true);
    if (error || !data) return [];
    return z.array(quizCatalogoLeituraSchema).parse(data);
  } catch {
    return [];
  }
}
