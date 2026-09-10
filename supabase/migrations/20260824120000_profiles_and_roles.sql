-- =============================================================================
-- Migration: profiles_and_roles
-- Task: T-005 (Autenticação completa) — IA/checklist/tasks.json
--
-- Cria a tabela `public.profiles` (perfil mínimo do usuário + role + consenti-
-- mento auditável de Termos/Privacidade), com RLS restrita ao dono da linha,
-- e um trigger que cria automaticamente uma linha em `profiles` a cada novo
-- usuário em `auth.users` (cadastro por e-mail/senha ou Google OAuth).
--
-- Escopo desta migration (ver `IA/docs/database.md`): apenas `profiles` +
-- roles, necessários para T-005. Demais tabelas (`user_progress`, `trilhas`,
-- etc.) ficam para as tasks correspondentes (T-007+).
--
-- Campos de onboarding completos (nascimento, estado_civil, objetivo) são
-- opcionais/nulos nesta migration — preenchidos depois pelo fluxo de
-- onboarding estilo Duolingo (T-006), que faz UPDATE na própria linha
-- (permitido pela policy `profiles_update_own` abaixo).
--
-- ATENÇÃO (ver relatório da T-005): esta migration NÃO foi testada
-- localmente (sem Docker/Supabase CLI disponíveis no ambiente em que foi
-- escrita). Precisa rodar `supabase db reset` + testes pgTAP assim que
-- Docker/Supabase CLI estiverem disponíveis, antes de aplicar em produção.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tipos enumerados
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'admin');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_civil_type') then
    create type public.estado_civil_type as enum (
      'solteiro',
      'casado',
      'uniao_estavel',
      'divorciado',
      'viuvo',
      'outro'
    );
  end if;
end
$$;

-- -----------------------------------------------------------------------------
-- 2. Tabela profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  nome text not null default '',
  sobrenome text not null default '',
  nascimento date,
  estado_civil public.estado_civil_type,
  avatar_url text,

  role public.app_role not null default 'user',

  -- Consentimento explícito e auditável (RF-06 / IA/docs/security.md:
  -- "timestamp + versão dos termos"). Preenchido a partir dos metadados
  -- enviados no momento do signUp (ver trigger handle_new_user abaixo).
  termos_aceitos_versao text,
  termos_aceitos_em timestamptz,
  privacidade_aceita_versao text,
  privacidade_aceita_em timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de aplicação do usuário (1:1 com auth.users), role e consentimento auditável de Termos/Privacidade.';
comment on column public.profiles.role is
  'user | admin. Alteração protegida pelo trigger profiles_protect_role (impede auto-promoção).';
comment on column public.profiles.nascimento is
  'Preenchido no onboarding (T-006), não no cadastro inicial.';
comment on column public.profiles.estado_civil is
  'Preenchido no onboarding (T-006), não no cadastro inicial.';

-- -----------------------------------------------------------------------------
-- 3. updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. Proteção contra auto-promoção de role
--
-- RLS (seção 6) permite que o próprio usuário faça UPDATE na sua linha de
-- `profiles` (para completar o onboarding). Sem esta proteção, isso incluiria
-- a coluna `role` — ou seja, qualquer usuário autenticado poderia se auto-
-- promover a 'admin' via uma chamada REST direta. Este trigger reverte
-- qualquer alteração de `role` feita por quem não é admin.
--
-- SECURITY DEFINER + dono da função com privilégio de bypass de RLS (padrão
-- para funções criadas por migration no Supabase) é o que permite a consulta
-- a `public.profiles` dentro da própria função sem recursão de RLS.
-- -----------------------------------------------------------------------------
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    ) then
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_profile_role();

-- -----------------------------------------------------------------------------
-- 5. Trigger: cria profile automaticamente a cada novo usuário em auth.users
--
-- Cobre tanto cadastro por e-mail/senha (metadados enviados via
-- `supabase.auth.signUp({ options: { data: {...} } })`, ver
-- src/features/authentication/context/AuthContext.tsx) quanto login via
-- Google OAuth (metadados vêm do provedor: given_name/family_name/name).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  full_name text := meta ->> 'name';
begin
  insert into public.profiles (
    id,
    nome,
    sobrenome,
    termos_aceitos_versao,
    termos_aceitos_em,
    privacidade_aceita_versao,
    privacidade_aceita_em
  )
  values (
    new.id,
    coalesce(
      meta ->> 'nome',
      meta ->> 'given_name',
      nullif(split_part(full_name, ' ', 1), ''),
      ''
    ),
    coalesce(
      meta ->> 'sobrenome',
      meta ->> 'family_name',
      nullif(trim(substring(full_name from position(' ' in full_name) + 1)), ''),
      ''
    ),
    meta ->> 'termos_versao',
    nullif(meta ->> 'termos_aceitos_em', '')::timestamptz,
    meta ->> 'privacidade_versao',
    nullif(meta ->> 'privacidade_aceita_em', '')::timestamptz
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 6. Row Level Security
--
-- Sem policy de INSERT/DELETE para `authenticated`/`anon`: por padrão, sem
-- policy nenhuma linha pode ser inserida/apagada por essas roles — apenas o
-- trigger `handle_new_user` (SECURITY DEFINER, bypassa RLS) cria linhas.
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
