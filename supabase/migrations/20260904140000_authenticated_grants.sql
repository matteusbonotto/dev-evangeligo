-- =============================================================================
-- Migration: authenticated_grants
-- Descoberto ao verificar T-019 (RLS empírica contra o banco real, ver
-- ADR-026): o role `authenticated` — o que a aplicação de verdade usa para
-- todo usuário logado — também não tinha GRANT de tabela em
-- `public.profiles`/`public.consentimentos`. RLS *filtra* linhas para um
-- privilégio que a role já precisa ter; sem o GRANT de base, PostgREST
-- rejeita a chamada inteira com "permission denied for table ..." antes
-- mesmo de aplicar a policy — confirmado ao vivo: um SELECT autenticado em
-- `profiles` retornava 403, não um resultado vazio.
--
-- Esse gap era invisível até agora porque nenhuma feature construída até
-- T-018 lê `profiles`/`consentimentos` via REST — o dashboard usa o
-- usuário de demonstração (`DemoUser`, em memória) para tudo. Seria o
-- primeiro código real a ler o próprio perfil (ex.: um painel "minha
-- conta", ou T-015 admin) a esbarrar nisso.
--
-- Só os privilégios que as policies já esperam (nunca INSERT/DELETE em
-- profiles, nunca UPDATE/DELETE em consentimentos — mantém o
-- comportamento documentado nas migrations originais).
-- =============================================================================

grant select, update on public.profiles to authenticated;
grant select, insert on public.consentimentos to authenticated;
