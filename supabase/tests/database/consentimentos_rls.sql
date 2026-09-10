-- pgTAP: RLS de public.consentimentos (T-019 — mesma ressalva de
-- Docker/execução do profiles_rls.sql). Foco: a tabela é append-only
-- (RF-06/ADR-014) — nenhuma policy de UPDATE/DELETE deve existir para
-- `authenticated`, então qualquer tentativa afeta 0 linhas.
begin;
select plan(4);

select has_table('public', 'consentimentos', 'tabela consentimentos existe');
select policies_are(
  'public', 'consentimentos',
  ARRAY['consentimentos_select_own', 'consentimentos_insert_own'],
  'consentimentos só tem select/insert próprio — sem update/delete (append-only)'
);

select tests.create_supabase_user('usuario_c@teste.com');
select tests.authenticate_as('usuario_c@teste.com');

insert into public.consentimentos (user_id, terms_version, privacy_version, consent_source)
values (tests.get_supabase_uid('usuario_c@teste.com'), '2026-08-21', '2026-08-21', 'cadastro');

select is(
  (select count(*)::int from public.consentimentos where user_id = tests.get_supabase_uid('usuario_c@teste.com')),
  1,
  'usuário consegue inserir seu próprio registro de consentimento'
);

-- Sem policy de update para authenticated: 0 linhas afetadas, sem erro.
update public.consentimentos set consent_source = 'alterado'
where user_id = tests.get_supabase_uid('usuario_c@teste.com');

select is(
  (select consent_source from public.consentimentos where user_id = tests.get_supabase_uid('usuario_c@teste.com')),
  'cadastro',
  'consentimento não pode ser alterado depois de criado (append-only, sem policy de update)'
);

select * from finish();
rollback;
