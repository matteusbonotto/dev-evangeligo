import type { RealtimeChannel } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseClient } from "../../infrastructure/supabase/client";
import {
  amigoSchema,
  calcularConversaId,
  mensagemSchema,
  solicitacaoAmizadeSchema,
  usuarioBuscaSchema,
  type Amigo,
  type Mensagem,
  type SolicitacaoAmizade,
  type UsuarioBusca,
} from "./schemas";

/**
 * Client da Comunidade (T-014/ADR-057) — amigos, chat 1:1, convites de
 * missão colaborativa. Nunca `service_role` no frontend (regra 11); toda
 * função lança se o Supabase não estiver configurado (modo demonstração
 * não tem amigos/chat reais — mesmo padrão de `authentication/lgpd.ts`).
 */
function exigirSupabase() {
  if (!supabaseClient) {
    throw new Error("Supabase não configurado.");
  }
  return supabaseClient;
}

export async function buscarUsuariosParaAmizade(termo: string): Promise<UsuarioBusca[]> {
  const client = exigirSupabase();
  const { data, error } = await client.rpc("buscar_usuarios_para_amizade", { termo });
  if (error) throw new Error(error.message);
  return z.array(usuarioBuscaSchema).parse(data ?? []);
}

export async function enviarSolicitacaoAmizade(destinatarioId: string): Promise<void> {
  const client = exigirSupabase();
  const { data: sessao } = await client.auth.getUser();
  const meuId = sessao.user?.id;
  if (!meuId) throw new Error("Não autenticado.");
  const { error } = await client
    .from("amigos")
    .insert({ solicitante_id: meuId, destinatario_id: destinatarioId });
  if (error) throw new Error(error.message);
}

export async function responderSolicitacaoAmizade(
  solicitacaoId: string,
  aceitar: boolean,
): Promise<void> {
  const client = exigirSupabase();
  if (aceitar) {
    const { error } = await client
      .from("amigos")
      .update({ status: "aceita" })
      .eq("id", solicitacaoId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await client.from("amigos").delete().eq("id", solicitacaoId);
    if (error) throw new Error(error.message);
  }
}

export async function removerAmizade(solicitacaoOuAmizadeId: string): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("amigos").delete().eq("id", solicitacaoOuAmizadeId);
  if (error) throw new Error(error.message);
}

export async function listarAmigos(): Promise<Amigo[]> {
  const client = exigirSupabase();
  const { data, error } = await client.rpc("listar_amigos");
  if (error) throw new Error(error.message);
  return z.array(amigoSchema).parse(data ?? []);
}

export async function listarSolicitacoesPendentes(): Promise<SolicitacaoAmizade[]> {
  const client = exigirSupabase();
  const { data, error } = await client.rpc("listar_solicitacoes_pendentes");
  if (error) throw new Error(error.message);
  return z.array(solicitacaoAmizadeSchema).parse(data ?? []);
}

export async function listarMensagens(meuId: string, amigoId: string): Promise<Mensagem[]> {
  const client = exigirSupabase();
  const conversaId = calcularConversaId(meuId, amigoId);
  const { data, error } = await client
    .from("mensagens")
    .select("*")
    .eq("conversa_id", conversaId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return z.array(mensagemSchema).parse(data ?? []);
}

export async function enviarMensagem(
  meuId: string,
  amigoId: string,
  conteudo: string,
): Promise<void> {
  const client = exigirSupabase();
  const { error } = await client.from("mensagens").insert({
    conversa_id: calcularConversaId(meuId, amigoId),
    remetente_id: meuId,
    destinatario_id: amigoId,
    conteudo,
  });
  if (error) throw new Error(error.message);
}

export async function marcarMensagensComoLidas(meuId: string, amigoId: string): Promise<void> {
  const client = exigirSupabase();
  await client
    .from("mensagens")
    .update({ lida: true })
    .eq("conversa_id", calcularConversaId(meuId, amigoId))
    .eq("destinatario_id", meuId)
    .eq("lida", false);
}

/**
 * Assina novas mensagens de UMA conversa via Supabase Realtime. Devolve a
 * função de cancelamento — chamar ao desmontar o componente.
 */
export function assinarMensagens(
  meuId: string,
  amigoId: string,
  aoReceber: (mensagem: Mensagem) => void,
): () => void {
  if (!supabaseClient) return () => {};
  const conversaId = calcularConversaId(meuId, amigoId);
  const canal: RealtimeChannel = supabaseClient
    .channel(`mensagens:${conversaId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "mensagens", filter: `conversa_id=eq.${conversaId}` },
      (payload) => {
        const resultado = mensagemSchema.safeParse(payload.new);
        if (resultado.success) aoReceber(resultado.data);
      },
    )
    .subscribe();
  return () => {
    void supabaseClient?.removeChannel(canal);
  };
}

export async function convidarParaMissaoColaborativa(
  missionTemplateId: string,
  convidadoId: string,
): Promise<void> {
  const client = exigirSupabase();
  const { data: sessao } = await client.auth.getUser();
  const meuId = sessao.user?.id;
  if (!meuId) throw new Error("Não autenticado.");
  const { error } = await client
    .from("missoes_colaborativas_convites")
    .insert({ mission_template_id: missionTemplateId, convidante_id: meuId, convidado_id: convidadoId });
  if (error) throw new Error(error.message);
}
