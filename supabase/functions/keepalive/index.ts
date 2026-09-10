// Edge Function: keepalive
//
// Motivo: projetos Supabase no plano gratuito são pausados automaticamente
// após ~7 dias sem atividade. Esta função faz uma leitura trivial no banco
// (não altera dados) para contar como atividade e manter o projeto ativo.
// Agendada via pg_cron (ver migration 20260903_keepalive_schedule.sql).
//
// Deploy com --no-verify-jwt: a função não expõe nem altera nenhum dado
// sensível (só um SELECT de contagem), então pode ser chamada sem
// autenticação para simplificar o agendamento via pg_net a partir do
// próprio Postgres.
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({ ok: false, error: "missing_supabase_env" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, checkedAt: new Date().toISOString() }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
});
