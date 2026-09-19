import { z } from "zod";

/**
 * Schemas de domínio (Zod) da Comunidade (T-014/ADR-057) — amigos, chat 1:1
 * e convites de missão colaborativa. Regras puras, sem dependência de
 * React/Supabase — ver `IA/docs/architecture.md`.
 */

const avatarConfigSchema = z.record(z.string(), z.string()).nullable();

export const usuarioBuscaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  sobrenome: z.string(),
  avatar_config: avatarConfigSchema,
});
export type UsuarioBusca = z.infer<typeof usuarioBuscaSchema>;

export const amigoSchema = z.object({
  amigo_id: z.string(),
  nome: z.string(),
  sobrenome: z.string(),
  avatar_config: avatarConfigSchema,
});
export type Amigo = z.infer<typeof amigoSchema>;

export const solicitacaoAmizadeSchema = z.object({
  id: z.string(),
  direcao: z.enum(["enviada", "recebida"]),
  outro_id: z.string(),
  nome: z.string(),
  sobrenome: z.string(),
  avatar_config: avatarConfigSchema,
  created_at: z.string(),
});
export type SolicitacaoAmizade = z.infer<typeof solicitacaoAmizadeSchema>;

export const mensagemSchema = z.object({
  id: z.string(),
  conversa_id: z.string(),
  remetente_id: z.string(),
  destinatario_id: z.string(),
  conteudo: z.string().min(1).max(2000),
  lida: z.boolean(),
  created_at: z.string(),
});
export type Mensagem = z.infer<typeof mensagemSchema>;

export const conviteMissaoSchema = z.object({
  id: z.string(),
  mission_template_id: z.string(),
  convidante_id: z.string(),
  convidado_id: z.string(),
  status: z.enum(["pendente", "aceito", "recusado"]),
  created_at: z.string(),
});
export type ConviteMissao = z.infer<typeof conviteMissaoSchema>;

/** Calcula um id de conversa determinístico e simétrico entre 2 usuários. */
export function calcularConversaId(usuarioA: string, usuarioB: string): string {
  return [usuarioA, usuarioB].sort().join(":");
}
