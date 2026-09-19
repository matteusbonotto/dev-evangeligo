import { z } from "zod";
import { bibleReferenceSchema } from "../study/schemas";
import { quizQuestionSchema } from "../study/quiz/schemas";
import { supabaseClient } from "../../infrastructure/supabase/client";
import type {
  AppRole,
  AulaCatalogo,
  AulaForm,
  ConquistaCatalogo,
  ConquistaForm,
  MissaoCatalogo,
  MissaoForm,
  QuizCatalogo,
  QuizForm,
  TrilhaCatalogo,
  TrilhaForm,
  UsuarioAdmin,
} from "./schemas";

/**
 * Client do painel admin (T-015) — sempre via RPC/tabela real (nunca
 * `service_role` no frontend, regra 11). Todas as funções lançam se o
 * Supabase não estiver configurado (mesmo padrão de `authentication/lgpd.ts`).
 */
function exigirSupabase() {
  if (!supabaseClient) {
    throw new Error("Supabase não configurado.");
  }
  return supabaseClient;
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const client = exigirSupabase();
  const { data, error } = await client.rpc("listar_usuarios_admin");
  if (error) throw new Error(error.message);
  return (data ?? []) as UsuarioAdmin[];
}

export async function definirRoleUsuario(
  usuarioId: string,
  novoRole: AppRole,
): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.rpc("definir_role_usuario", {
    usuario_id: usuarioId,
    novo_role: novoRole,
  });
  if (error) throw new Error(error.message);
}

export async function listarConquistasCatalogo(): Promise<ConquistaCatalogo[]> {
  const client = exigirSupabase();
  const { data, error } = await client
    .from("conquistas_catalogo")
    .select("*")
    .order("raridade", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ConquistaCatalogo[];
}

export async function salvarConquistaCatalogo(form: ConquistaForm): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("conquistas_catalogo").upsert(form);
  if (error) throw new Error(error.message);
}

export async function excluirConquistaCatalogo(id: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("conquistas_catalogo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listarMissoesCatalogo(): Promise<MissaoCatalogo[]> {
  const client = exigirSupabase();
  const { data, error } = await client
    .from("missoes_catalogo")
    .select("*")
    .order("tipo", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as MissaoCatalogo[];
}

export async function salvarMissaoCatalogo(form: MissaoForm): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("missoes_catalogo").upsert(form);
  if (error) throw new Error(error.message);
}

export async function excluirMissaoCatalogo(id: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("missoes_catalogo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Trilhas/Aulas/Quizzes ADICIONAIS (T-015/ADR-056) — ver `schemas.ts` para
 * o racional de guardar `verse_focus`/`bible_references`/`questions` como
 * texto JSON no formulário. `parseJsonCampo` lança um erro com a mensagem
 * do Zod quando o JSON colado não tem o formato esperado, em vez de deixar
 * o Supabase rejeitar com um erro menos claro.
 */
function parseJsonCampo<T>(schema: z.ZodType<T>, texto: string, nomeCampo: string): T {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch {
    throw new Error(`${nomeCampo}: JSON inválido.`);
  }
  const resultado = schema.safeParse(bruto);
  if (!resultado.success) {
    throw new Error(`${nomeCampo}: ${resultado.error.issues[0]?.message ?? "formato inválido"}.`);
  }
  return resultado.data;
}

export async function listarTrilhasCatalogo(): Promise<TrilhaCatalogo[]> {
  const client = exigirSupabase();
  const { data, error } = await client
    .from("trilhas_catalogo")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as TrilhaCatalogo[];
}

export async function salvarTrilhaCatalogo(form: TrilhaForm): Promise<void> {
  const client = exigirSupabase();
  const verseFocus = form.verse_focus.trim()
    ? parseJsonCampo(bibleReferenceSchema, form.verse_focus, "Referência-âncora")
    : null;
  const { error } = await client.from("trilhas_catalogo").upsert({
    id: form.id,
    slug: form.slug,
    order: form.order,
    title: form.title,
    description: form.description,
    verse_focus: verseFocus,
    ativo: form.ativo,
  });
  if (error) throw new Error(error.message);
}

export async function excluirTrilhaCatalogo(id: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("trilhas_catalogo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listarAulasCatalogo(): Promise<AulaCatalogo[]> {
  const client = exigirSupabase();
  const { data, error } = await client
    .from("aulas_catalogo")
    .select("*")
    .order("order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AulaCatalogo[];
}

export async function salvarAulaCatalogo(form: AulaForm): Promise<void> {
  const client = exigirSupabase();
  const bibleReferences = parseJsonCampo(
    z.array(bibleReferenceSchema).min(2),
    form.bible_references,
    "Referências bíblicas",
  );
  const { error } = await client.from("aulas_catalogo").upsert({
    id: form.id,
    trilha_id: form.trilha_id,
    order: form.order,
    title: form.title,
    summary: form.summary,
    bible_references: bibleReferences,
    estimated_minutes: form.estimated_minutes,
    quiz_id: form.quiz_id.trim() || null,
    ativo: form.ativo,
  });
  if (error) throw new Error(error.message);
}

export async function excluirAulaCatalogo(id: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("aulas_catalogo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listarQuizzesCatalogo(): Promise<QuizCatalogo[]> {
  const client = exigirSupabase();
  const { data, error } = await client
    .from("quizzes_catalogo")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as QuizCatalogo[];
}

export async function salvarQuizCatalogo(form: QuizForm): Promise<void> {
  const client = exigirSupabase();
  const questions = parseJsonCampo(
    z.array(quizQuestionSchema).min(3),
    form.questions,
    "Perguntas",
  );
  const { error } = await client.from("quizzes_catalogo").upsert({
    id: form.id,
    aula_id: form.aula_id.trim() || null,
    title: form.title,
    questions,
    ativo: form.ativo,
  });
  if (error) throw new Error(error.message);
}

export async function excluirQuizCatalogo(id: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("quizzes_catalogo").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
