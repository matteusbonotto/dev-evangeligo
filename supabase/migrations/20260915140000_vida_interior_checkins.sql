-- =============================================================================
-- Migration: vida_interior_checkins
-- Task: T-059 (ver IA/memory/decisions.md ADR-051)
--
-- Achado real: "Vida Interior" (Fruto do Espírito × Obra da Carne,
-- Gálatas 5:16-23) no Dashboard mostrava percentuais 100% ESTÁTICOS pra
-- TODA conta, demo ou real — nenhum dado de verdade por trás, mesmo
-- gap que já existia pro RPG antes de T-047. Esta migration guarda um
-- check-in diário rápido ("hoje você viveu mais fruto ou obra, neste
-- par?"); os percentuais reais são calculados no cliente (janela móvel
-- de 30 dias, ver src/features/dashboard/vidaInterior.ts) — nenhuma
-- agregação no banco necessária pelo volume pequeno (no máximo 9
-- check-ins/dia por usuário).
--
-- Append-only, mesmo padrão de `consentimentos` (T-016/ADR-014): nunca
-- UPDATE/DELETE pela aplicação — cada check-in vira uma linha nova, o
-- histórico completo fica preservado (dá pra, no futuro, mostrar
-- tendência ao longo do tempo, não só a janela dos últimos 30 dias).
-- =============================================================================

create table if not exists public.vida_interior_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Um dos 9 ids de `src/features/dashboard/data/paresVidaInterior.ts`
  -- (ex.: "amor", "paz", "dominio-proprio") — catálogo em código, não em
  -- tabela, igual ao padrão já usado pra itens/armadura/conquistas.
  par_id text not null,
  escolha text not null check (escolha in ('fruto', 'carne')),

  created_at timestamptz not null default now()
);

comment on table public.vida_interior_checkins is
  'Check-in diário de Vida Interior (Fruto do Espírito x Obra da Carne, Gl 5:16-23) por usuário real, T-059/ADR-051. Append-only, nunca UPDATE/DELETE pela aplicação — percentuais calculados no cliente a partir de uma janela móvel de 30 dias.';

create index if not exists vida_interior_checkins_user_par_idx
  on public.vida_interior_checkins (user_id, par_id, created_at desc);

alter table public.vida_interior_checkins enable row level security;

drop policy if exists vida_interior_checkins_select_own on public.vida_interior_checkins;
create policy vida_interior_checkins_select_own
  on public.vida_interior_checkins
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists vida_interior_checkins_insert_own on public.vida_interior_checkins;
create policy vida_interior_checkins_insert_own
  on public.vida_interior_checkins
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Grant de tabela — RLS filtra LINHAS, mas a role ainda precisa do
-- privilégio de TABELA correspondente, senão PostgREST rejeita com
-- "permission denied" antes mesmo de aplicar a policy (mesmo achado real
-- de authenticated_grants.sql, 2026-09-04 — não repetir esse gap aqui).
grant select, insert on public.vida_interior_checkins to authenticated;
