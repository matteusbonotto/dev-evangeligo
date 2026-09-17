-- =============================================================================
-- Migration: onboarding_avatar
-- Task: T-077b (10º passo do onboarding — escolha de avatar)
--
-- Estende `handle_new_user()` (última versão em `20260904120000_
-- onboarding_objetivo.sql`) pra também popular `avatar_config`/`avatar_url`
-- (colunas já existentes desde `20260915090000_avatar_config.sql`, usadas
-- até agora só por `persistirEstadoRpgReal`) a partir da metadata enviada
-- no `auth.signUp()` — mesmo mecanismo já usado pra nascimento/estado_civil/
-- objetivo, pelo mesmo motivo (a conta por e-mail/senha pode não ter sessão
-- imediata, o que bloquearia um UPDATE via RLS logo após o cadastro).
-- Contas Google não passam por aqui (já existem antes do onboarding rodar)
-- — `completarCadastroGoogle` grava via UPDATE direto, sessão já garantida.
-- =============================================================================

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
    privacidade_aceita_em,
    avatar_config,
    avatar_url
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
    nullif(meta ->> 'privacidade_aceita_em', '')::timestamptz,
    meta -> 'avatar_config',
    nullif(meta ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
