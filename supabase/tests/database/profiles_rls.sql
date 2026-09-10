-- pgTAP: RLS de public.profiles (T-019, IA/docs/testing.md: "Banco: pgTAP —
-- roles, policies, RLS, funções"). Precisa de Docker local (`supabase test
-- db`) — não executável neste ambiente (sem Docker, ver IA/memory/
-- project-memory.md). As mesmas invariantes já foram verificadas
-- empiricamente contra o banco remoto real via REST/Admin API antes de
-- escrever este arquivo (ADR-026) — este arquivo formaliza essas mesmas
-- checagens para rodar em CI assim que Docker estiver disponível.
begin;
select plan(7);

select has_table('public', 'profiles', 'tabela profiles existe');
select policies_are(
  'public', 'profiles',
  ARRAY['profiles_select_own', 'profiles_update_own'],
  'profiles só tem as policies select/update própria — sem insert/delete direto para authenticated'
);

-- Dois usuários de teste.
select tests.create_supabase_user('usuario_a@teste.com');
select tests.create_supabase_user('usuario_b@teste.com');

select tests.authenticate_as('usuario_a@teste.com');

select is(
  (select count(*)::int from public.profiles where id = tests.get_supabase_uid('usuario_a@teste.com')),
  1,
  'usuário A enxerga a própria linha de profile (criada pelo trigger handle_new_user)'
);

select is(
  (select count(*)::int from public.profiles where id = tests.get_supabase_uid('usuario_b@teste.com')),
  0,
  'usuário A NÃO enxerga a linha de profile do usuário B (RLS select)'
);

-- Usuário A tenta se auto-promover a admin — o trigger protect_profile_role
-- deve reverter silenciosamente, sem erro.
update public.profiles set role = 'admin' where id = tests.get_supabase_uid('usuario_a@teste.com');
select is(
  (select role::text from public.profiles where id = tests.get_supabase_uid('usuario_a@teste.com')),
  'user',
  'usuário A não consegue se auto-promover a admin (trigger protect_profile_role reverte)'
);

-- Usuário A tenta atualizar a linha do usuário B — RLS deve bloquear
-- (0 linhas afetadas, sem erro, por causa do USING da policy de update).
update public.profiles set nome = 'hackeado' where id = tests.get_supabase_uid('usuario_b@teste.com');
select is(
  (select nome from public.profiles where id = tests.get_supabase_uid('usuario_b@teste.com')),
  '',
  'usuário A não consegue alterar a linha de profile do usuário B (RLS update)'
);

select tests.clear_authentication();
select is(
  (select count(*)::int from public.profiles),
  0,
  'anônimo (sem sessão) não enxerga nenhuma linha de profiles'
);

select * from finish();
rollback;
