// Edge Function: delete-account
//
// LGPD — exclusão de conta (T-020, ver IA/docs/privacy.md seção 3). Precisa
// rodar aqui (não uma RPC direta do cliente) porque apagar de `auth.users`
// exige a API de admin do Supabase, que só existe com `service_role` — e
// `service_role` nunca roda no frontend (regra 11).
//
// Identidade: SEMPRE lida do JWT de quem chama esta função (nunca um
// user_id recebido no corpo da requisição) — impossível pedir a exclusão
// de outra conta.
//
// Efeito: `auth.admin.deleteUser` apaga a linha de `auth.users`; toda
// tabela de dado pessoal hoje (`profiles`, `consentimentos`, `rpg_*`,
// `vida_interior_checkins`) referencia `auth.users(id) on delete cascade`
// (ver migrations), então a exclusão é IMEDIATA e completa — sem
// anonimização nem prazo de retenção de 90 dias (ADR-012), porque nenhuma
// dessas tabelas hoje é compartilhada com outro usuário (isso muda quando
// features sociais/chat existirem — ver nota em IA/memory/decisions.md).
// `consentimentos` some junto: diverge do desenho original de
// IA/docs/privacy.md (manter como prova de consentimento) — decisão
// deliberada de simplicidade + minimização de dados, sinalizada para
// confirmação na revisão jurídica formal (mesmo padrão de ADR-012).
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return new Response(JSON.stringify({ ok: false, error: "internal_error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  if (!authHeader) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Cliente com a sessão de quem chamou (anon key + Authorization
  // repassado) — só serve pra identificar o usuário de forma confiável.
  const clienteChamador = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: erroUsuario,
  } = await clienteChamador.auth.getUser();

  if (erroUsuario || !user) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const clienteAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { error: erroExclusao } = await clienteAdmin.auth.admin.deleteUser(user.id);

  if (erroExclusao) {
    console.error("delete-account: falha ao excluir", user.id, erroExclusao.message);
    return new Response(JSON.stringify({ ok: false, error: "internal_error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  // Log de auditoria mínimo (regra 15: nunca logar dado sensível) — só
  // registra QUE a exclusão aconteceu, não o conteúdo apagado.
  console.log("delete-account: conta excluída", user.id, new Date().toISOString());

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
});
