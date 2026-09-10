-- =============================================================================
-- Migration: onboarding_objetivo
-- Task: T-006 (Onboarding estilo Duolingo) — IA/checklist/tasks.json
--
-- Adiciona a coluna `objetivo` (7º passo do onboarding, sem equivalente nos
-- campos já existentes de `profiles`) e estende o trigger `handle_new_user`
-- (criado em `20260824120000_profiles_and_roles.sql`) para popular
-- `nascimento`/`estado_civil`/`objetivo` a partir dos metadados enviados no
-- momento do cadastro (`supabase.auth.signUp({ options: { data: {...} } })`).
--
-- Por que estender o INSERT em vez de fazer um UPDATE separado depois do
-- cadastro (como o comentário original da migration anterior sugeria): o
-- onboarding de 7 passos (`OnboardingPage.tsx`) coleta TODOS os campos em
-- memória e só cria a conta no passo final — igual ao app legado
-- (`finalizarCadastro()` em `app.js`) — por isso não há garantia de sessão
-- autenticada logo depois do `signUp()` (o Supabase pode exigir confirmação
-- de e-mail antes de liberar sessão, o que bloquearia um UPDATE via RLS).
-- Popular tudo dentro do trigger (SECURITY DEFINER, roda independente de
-- sessão) evita essa corrida.
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'objetivo_type') then
    create type public.objetivo_type as enum (
      'conhecer_biblia',
      'habito_diario',
      'teologia_reformada',
      'discipulado',
      'familia',
      'outro'
    );
  end if;
end
$$;

alter table public.profiles
  add column if not exists objetivo public.objetivo_type;

comment on column public.profiles.objetivo is
  'Motivo de estudo escolhido no 7º passo do onboarding (T-006) — obrigatório na UI, mas nulo aqui para contas criadas antes desta migration.';

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
    nascimento,
    estado_civil,
    objetivo,
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
    nullif(meta ->> 'nascimento', '')::date,
    nullif(meta ->> 'estado_civil', '')::public.estado_civil_type,
    nullif(meta ->> 'objetivo', '')::public.objetivo_type,
    meta ->> 'termos_versao',
    nullif(meta ->> 'termos_aceitos_em', '')::timestamptz,
    meta ->> 'privacidade_versao',
    nullif(meta ->> 'privacidade_aceita_em', '')::timestamptz
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
