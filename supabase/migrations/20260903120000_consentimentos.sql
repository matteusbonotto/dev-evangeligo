-- =============================================================================
-- Migration: consentimentos
-- Task: T-016 (Documentos legais e consentimento) — IA/checklist/tasks.json
-- Modelo de dados desenhado no relatório da T-016 (ver IA/memory/decisions.md
-- ADR-014, IA/docs/database.md e IA/docs/privacy.md).
--
-- Registro auditável de consentimento (RF-06): cada aceite de Termos de Uso
-- e Política de Privacidade vira uma linha imutável (append-only). Nunca
-- UPDATE/DELETE pela aplicação — um reaceite (ex.: após mudança material dos
-- documentos) insere uma nova linha, preservando o histórico completo.
-- =============================================================================

create table if not exists public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  terms_version text not null,
  privacy_version text not null,
  accepted_sensitive_data boolean not null default true,
  consent_source text not null,

  ip_address inet,
  user_agent text,

  created_at timestamptz not null default now()
);

comment on table public.consentimentos is
  'Registro append-only de consentimento auditável (Termos/Privacidade), RF-06. Nunca UPDATE/DELETE pela aplicação.';
comment on column public.consentimentos.accepted_sensitive_data is
  'Confirma que o usuário foi informado de que dados de engajamento religioso/doutrinário são dado sensível (LGPD art. 11) e consentiu especificamente com esse tratamento.';
comment on column public.consentimentos.consent_source is
  'Onde o consentimento foi coletado, ex.: "onboarding_signup", "reconsent_modal".';

create index if not exists consentimentos_user_id_idx
  on public.consentimentos (user_id, created_at desc);

alter table public.consentimentos enable row level security;

-- Sem policy de UPDATE/DELETE para nenhuma role além de service_role
-- (padrão do Supabase: sem policy, nenhuma linha pode ser alterada/apagada
-- por authenticated/anon) — reforça o caráter append-only da tabela.

drop policy if exists consentimentos_select_own on public.consentimentos;
create policy consentimentos_select_own
  on public.consentimentos
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists consentimentos_insert_own on public.consentimentos;
create policy consentimentos_insert_own
  on public.consentimentos
  for insert
  to authenticated
  with check (auth.uid() = user_id);
