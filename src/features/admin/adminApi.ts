import { supabaseClient } from "../../infrastructure/supabase/client";
import type {
  AppRole,
  ConquistaCatalogo,
  ConquistaForm,
  MissaoCatalogo,
  MissaoForm,
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
