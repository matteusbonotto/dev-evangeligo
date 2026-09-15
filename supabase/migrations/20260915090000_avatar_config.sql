-- =============================================================================
-- Migration: avatar_config
-- Task: T-053 (ver IA/memory/decisions.md ADR-046)
--
-- Achado real (itens 4/5/6 do feedback de 2026-09-15): o avatar ilustrado
-- (editor Avataaars, `src/features/avatar/`) só existia em `localStorage`,
-- igual pra demo e conta real — nunca chegava no Supabase, então nunca
-- aparecia fora do anel de armadura do Dashboard nem sobrevivia a um
-- dispositivo diferente. `profiles.avatar_url` já existia desde a migration
-- original (nunca usado por nenhum código) — falta só a CONFIG estruturada,
-- pra reabrir o editor já com as opções certas marcadas (a URL sozinha não
-- é reversível pras opções individuais sem reimplementar o parser).
-- =============================================================================

alter table public.profiles
  add column if not exists avatar_config jsonb;

comment on column public.profiles.avatar_config is
  'Configuração estruturada do editor de avatar (AvatarConfig, src/features/avatar/types.ts) — permite reabrir o editor com as opções já marcadas. avatar_url guarda a URL renderizada (montarUrlAvatar), pronta pra <img src>.';
