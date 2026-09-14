-- Agendamento do keepalive (T-043/ADR-037) — pendência registrada desde
-- 2026-09-04 em `IA/memory/project-memory.md`: a função `keepalive`
-- (`supabase/functions/keepalive/`) evita que o projeto gratuito seja
-- pausado por inatividade (~7 dias), mas só funciona se algo a chamar
-- periodicamente. `pg_cron` agenda a chamada; `pg_net` faz a requisição
-- HTTP de dentro do Postgres.
--
-- A chave usada aqui é a `anon` (pública, publishable) — a mesma que já
-- vai para o bundle do frontend — não a `service_role`/secreta (regra 11
-- do projeto: nunca usar `service_role` fora do necessário). A função em
-- si só faz um SELECT de contagem trivial (ver `keepalive/index.ts`), sem
-- expor nem alterar dado nenhum, por isso foi deployada com
-- `--no-verify-jwt` e não precisa de autenticação real — a chave aqui é
-- só para passar pelo gateway da API, não uma credencial sensível.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Roda a cada 3 dias — folga confortável contra o limite de ~7 dias de
-- inatividade do plano gratuito, sem chamar a função com mais frequência
-- do que o necessário (regra 3 do projeto: mínimo necessário).
select
  cron.schedule(
    'keepalive-evangeligogame',
    '0 6 */3 * *', -- 06:00 UTC, a cada 3 dias
    $$
    select
      net.http_get(
        url := 'https://mblunwkcdwoodrizkjwe.supabase.co/functions/v1/keepalive',
        headers := jsonb_build_object(
          'apikey', 'sb_publishable_ZKmFRkUSHENdTj0pz48jGg_8OxGPHT_'
        )
      );
    $$
  )
where not exists (
  select 1 from cron.job where jobname = 'keepalive-evangeligogame'
);
