-- =============================================================================
-- Migration: service_role_grants
-- Descoberto ao verificar T-006 (onboarding) contra o banco real: mesmo
-- possuindo o atributo BYPASSRLS, o role `service_role` não tinha o GRANT de
-- privilégio de TABELA em `public.profiles`/`public.consentimentos` — RLS e
-- privilégio de tabela são checados separadamente pelo Postgres, então
-- bypass de RLS sozinho não basta para o Supabase REST (PostgREST) aceitar
-- a leitura/escrita. Sem isto, qualquer ferramenta futura que use a chave
-- de serviço (ex.: painel admin, T-015) para ler/gerenciar estas tabelas
-- receberia "permission denied for table ...".
--
-- Escopo: só as duas tabelas hoje existentes. Toda tabela nova criada por
-- migrations futuras precisa lembrar do mesmo GRANT (ou definir um
-- `ALTER DEFAULT PRIVILEGES` — deixado fora daqui de propósito, para não
-- mudar silenciosamente o comportamento de tabelas que ainda nem existem).
-- =============================================================================

grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.consentimentos to service_role;
