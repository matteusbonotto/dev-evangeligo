-- =============================================================================
-- Migration: admin_painel
-- Task: T-015 (painel admin) — pedido explícito do usuário: "tela de admin,
-- login admin e crud de conquistas, missões, desafios, e afins".
--
-- Escopo desta migration (ver IA/memory/decisions.md ADR-054 para o
-- raciocínio completo):
--  1. `public.is_admin()` — helper reaproveitando o idioma já usado em
--     `protect_profile_role()` (20260824120000), pra não repetir a mesma
--     subconsulta em toda policy nova.
--  2. RPCs `listar_usuarios_admin`/`definir_role_usuario` — o painel admin
--     precisa listar TODOS os usuários (não só o próprio, como a policy
--     `profiles_select_own` permite) e promover/rebaixar role. Em vez de
--     abrir uma policy RLS ampla "admin lê/edita qualquer profiles", duas
--     RPCs SECURITY DEFINER com o check de admin embutido são mais
--     auditáveis (só 2 operações possíveis, não um CRUD REST genérico) e
--     não precisam de `service_role`/edge function — `auth.users.email`
--     também só é legível assim (não existe em `public.profiles`).
--  3. `conquistas_catalogo`/`missoes_catalogo` — hoje esses catálogos são
--     100% estáticos em código (`gamification/domain/achievements.ts`/
--     `missions.ts`). Login admin + CRUD real ficam aqui, mas a LEITURA do
--     app continua vindo do código nesta rodada (ver nota de escopo
--     abaixo) — o motor de conquistas usa uma função `condition` em
--     TypeScript por id, que não é dado serializável; mover isso pro banco
--     exigiria reescrever esse motor pra regras genéricas, fora do escopo
--     desta sessão. Missões já são 100% orientadas a dado (sem lógica de
--     condição própria por id), então o catálogo aqui é diretamente
--     utilizável assim que o sistema de missões for ligado a contas reais
--     (pendência já registrada em ADR-052).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. is_admin()
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'true se o usuário autenticado atual tiver profiles.role = admin. SECURITY DEFINER pra evitar recursão de RLS ao consultar profiles.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Gestão de usuários (RPCs, sem policy RLS ampla nova em profiles)
-- -----------------------------------------------------------------------------
create or replace function public.listar_usuarios_admin()
returns table (
  id uuid,
  email text,
  nome text,
  sobrenome text,
  role public.app_role,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select u.id, u.email, p.nome, p.sobrenome, p.role, p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

comment on function public.listar_usuarios_admin() is
  'Lista todos os usuários (id/email/nome/role) para o painel admin (T-015). Devolve 0 linhas silenciosamente se quem chama não for admin (checado dentro da própria query via is_admin()).';

revoke all on function public.listar_usuarios_admin() from public;
grant execute on function public.listar_usuarios_admin() to authenticated;

create or replace function public.definir_role_usuario(
  usuario_id uuid,
  novo_role public.app_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Apenas administradores podem alterar o papel de um usuário.' using errcode = '42501';
  end if;
  if usuario_id = auth.uid() then
    raise exception 'Não é possível alterar o próprio papel por aqui (evita um admin se auto-rebaixar por engano).' using errcode = '42501';
  end if;
  update public.profiles set role = novo_role where id = usuario_id;
end;
$$;

comment on function public.definir_role_usuario(uuid, public.app_role) is
  'Promove/rebaixa profiles.role de OUTRO usuário (nunca o próprio chamador). Só admins podem chamar (T-015).';

revoke all on function public.definir_role_usuario(uuid, public.app_role) from public;
grant execute on function public.definir_role_usuario(uuid, public.app_role) to authenticated;

-- -----------------------------------------------------------------------------
-- 3. conquistas_catalogo (metadados admin-editáveis; condição de desbloqueio
--    continua em `gamification/domain/achievements.ts`, casada pelo `id`)
-- -----------------------------------------------------------------------------
create table if not exists public.conquistas_catalogo (
  id text primary key,
  titulo text not null,
  descricao text not null,
  raridade text not null check (raridade in ('comum', 'raro', 'epico', 'lendario')),
  reward_xp integer not null default 0 check (reward_xp >= 0),
  reward_gold integer not null default 0 check (reward_gold >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.conquistas_catalogo is
  'Metadados admin-editáveis do catálogo de conquistas (T-015) — título/descrição/recompensa/raridade/ativo. A condição de desbloqueio (função pura por id) continua em gamification/domain/achievements.ts; ligar a leitura do app a esta tabela é trabalho futuro (ver ADR-054).';

alter table public.conquistas_catalogo enable row level security;

drop policy if exists conquistas_catalogo_select_all on public.conquistas_catalogo;
create policy conquistas_catalogo_select_all
  on public.conquistas_catalogo
  for select
  to authenticated, anon
  using (true);

drop policy if exists conquistas_catalogo_admin_all on public.conquistas_catalogo;
create policy conquistas_catalogo_admin_all
  on public.conquistas_catalogo
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists conquistas_catalogo_set_updated_at on public.conquistas_catalogo;
create trigger conquistas_catalogo_set_updated_at
  before update on public.conquistas_catalogo
  for each row
  execute function public.set_updated_at();

grant select on public.conquistas_catalogo to authenticated, anon;
grant insert, update, delete on public.conquistas_catalogo to authenticated;

insert into public.conquistas_catalogo (id, titulo, descricao, raridade, reward_xp, reward_gold)
values
  ('primeiro-passo', 'Primeiro Passo', 'Concluiu sua primeira aula.', 'comum', 10, 5),
  ('primeira-sequencia', 'Constância Inicial', 'Manteve uma sequência de 3 dias.', 'comum', 15, 10),
  ('primeiro-quiz', 'Primeira Prova', 'Concluiu seu primeiro quiz.', 'comum', 10, 5),
  ('constancia', 'Constância', 'Manteve uma sequência de 7 dias.', 'raro', 50, 30),
  ('estudioso', 'Estudioso', 'Concluiu 10 aulas.', 'raro', 60, 40),
  ('acertador', 'Acertador', 'Concluiu 5 quizzes sem errar.', 'raro', 60, 40),
  ('em-ascensao', 'Em Ascensão', 'Alcançou o nível 10.', 'raro', 80, 50),
  ('soldado-de-cristo', 'Soldado de Cristo', 'Equipou as 6 peças da Armadura de Deus.', 'epico', 150, 100),
  ('mestre-dos-quizzes', 'Mestre dos Quizzes', 'Concluiu 20 quizzes sem errar.', 'epico', 150, 100),
  ('guerreiro-fiel', 'Guerreiro Fiel', 'Manteve uma sequência de 30 dias.', 'epico', 150, 100),
  ('maos-que-servem', 'Mãos que Servem', 'Concluiu 5 missões colaborativas.', 'epico', 150, 100),
  ('trilha-concluida', 'Trilha Concluída', 'Concluiu sua primeira trilha de estudo.', 'epico', 120, 80),
  ('armadura-completa', 'Armadura Completa de Deus', 'Equipou as 6 peças da mesma raridade.', 'lendario', 400, 250),
  ('centuriao-da-fe', 'Centurião da Fé', 'Manteve uma sequência de 100 dias.', 'lendario', 500, 300),
  ('teologo-reformado', 'Teólogo Reformado', 'Concluiu as 5 trilhas de estudo.', 'lendario', 500, 300),
  ('mestre-da-fe', 'Mestre da Fé', 'Alcançou o nível 30.', 'lendario', 600, 400)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 4. missoes_catalogo (100% orientado a dado — ver nota de escopo acima)
-- -----------------------------------------------------------------------------
create table if not exists public.missoes_catalogo (
  id text primary key,
  tipo text not null check (
    tipo in ('humana', 'espiritual', 'conhecimento', 'tarefa', 'casal', 'colaborativa')
  ),
  titulo text not null,
  descricao text not null,
  cadencia text not null check (cadencia in ('diaria', 'semanal')),
  meta integer not null check (meta > 0),
  reward_xp integer not null default 0 check (reward_xp >= 0),
  reward_gold integer not null default 0 check (reward_gold >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.missoes_catalogo is
  'Catálogo de missões (T-015) — 100% orientado a dado (tipo/cadência/meta/recompensa), sem lógica própria por id (diferente de conquistas). Utilizável assim que o sistema de missões for ligado a contas reais (ADR-052).';

alter table public.missoes_catalogo enable row level security;

drop policy if exists missoes_catalogo_select_all on public.missoes_catalogo;
create policy missoes_catalogo_select_all
  on public.missoes_catalogo
  for select
  to authenticated, anon
  using (true);

drop policy if exists missoes_catalogo_admin_all on public.missoes_catalogo;
create policy missoes_catalogo_admin_all
  on public.missoes_catalogo
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists missoes_catalogo_set_updated_at on public.missoes_catalogo;
create trigger missoes_catalogo_set_updated_at
  before update on public.missoes_catalogo
  for each row
  execute function public.set_updated_at();

grant select on public.missoes_catalogo to authenticated, anon;
grant insert, update, delete on public.missoes_catalogo to authenticated;

insert into public.missoes_catalogo (id, tipo, titulo, descricao, cadencia, meta, reward_xp, reward_gold)
values
  ('humana-gesto-gentileza', 'humana', 'Gesto de Gentileza', 'Faça algo gentil por alguém hoje.', 'diaria', 1, 20, 15),
  ('humana-ajuda-proximo', 'humana', 'Ajude o Próximo', 'Ajude alguém 3 vezes esta semana.', 'semanal', 3, 60, 40),
  ('espiritual-momento-oracao', 'espiritual', 'Momento de Oração', 'Dedique um momento de oração hoje.', 'diaria', 1, 15, 10),
  ('espiritual-reflexao-semanal', 'espiritual', 'Reflexão Semanal', 'Reserve um tempo de reflexão nesta semana.', 'semanal', 1, 50, 30),
  ('conhecimento-licao-do-dia', 'conhecimento', 'Lição do Dia', 'Conclua 1 aula hoje.', 'diaria', 1, 25, 15),
  ('conhecimento-maratona-estudo', 'conhecimento', 'Maratona de Estudo', 'Conclua 5 aulas nesta semana.', 'semanal', 5, 100, 60),
  ('conhecimento-prova-perfeita', 'conhecimento', 'Prova Perfeita', 'Conclua 1 quiz sem errar nesta semana.', 'semanal', 1, 60, 40),
  ('tarefa-leitura-biblica', 'tarefa', 'Leitura Bíblica', 'Leia um trecho da Bíblia hoje.', 'diaria', 1, 20, 10),
  ('tarefa-guardar-palavra', 'tarefa', 'Guardar a Palavra', 'Marque 3 versículos nesta semana.', 'semanal', 3, 45, 30),
  ('casal-devocional-a-dois', 'casal', 'Devocional a Dois', 'Façam um devocional juntos nesta semana.', 'semanal', 1, 70, 50),
  ('casal-oracao-conjunta', 'casal', 'Oração em Conjunto', 'Orem juntos hoje.', 'diaria', 1, 25, 15),
  ('colaborativa-chame-um-amigo', 'colaborativa', 'Chame um Amigo', 'Convide 1 amigo para o EvangeliGO nesta semana.', 'semanal', 1, 80, 60),
  ('colaborativa-desafio-em-grupo', 'colaborativa', 'Desafio em Grupo', 'Complete 5 atividades em grupo nesta semana.', 'semanal', 5, 120, 80)
on conflict (id) do nothing;
