-- =============================================================================
-- Migration: admin_conteudo_estudo
-- Task: T-015 (painel admin), extensão pedida pelo usuário: "1 pode incluir
-- tudo" — em resposta à pergunta se o CRUD do painel deveria cobrir também
-- trilhas/aulas/quiz (antes deliberadamente fora, ver ADR-054, por serem
-- conteúdo doutrinário).
--
-- Design: as 5 trilhas/17 aulas/5 quizzes JÁ existentes continuam 100%
-- estáticas em código (`study/content/*.ts`, `study/quiz/content.ts`) —
-- não foram migradas pra cá, para não arriscar transcrever mal conteúdo
-- doutrinário já revisado. Estas tabelas são um catálogo ADICIONAL: admin
-- pode criar NOVAS trilhas/aulas/quizzes que aparecem somadas às estáticas
-- (`TrilhasPage`/`AulaPage`/`QuizPage` passam a buscar aqui também). Nenhuma
-- revisão doutrinária automática acontece — cabe ao próprio admin seguir a
-- regra 18 (toda afirmação doutrinária com base bíblica explícita) e, older
-- idealmente, pedir revisão do agente teologia-reformada antes de publicar
-- conteúdo novo — o painel não impõe isso tecnicamente (decisão explícita
-- do usuário de abrir mão dessa trava, registrada em ADR-056).
-- =============================================================================

create table if not exists public.trilhas_catalogo (
  id text primary key,
  slug text not null unique,
  "order" integer not null,
  title text not null,
  description text not null,
  -- Guarda o BibleReference (book/chapter/verseStart/verseEnd/display) como
  -- jsonb — mesmo formato de `study/schemas.ts#bibleReferenceSchema`.
  verse_focus jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.trilhas_catalogo is
  'Trilhas de estudo ADICIONAIS criadas via painel admin (T-015/ADR-056) — as 5 originais continuam estáticas em código.';

alter table public.trilhas_catalogo enable row level security;

drop policy if exists trilhas_catalogo_select_all on public.trilhas_catalogo;
create policy trilhas_catalogo_select_all
  on public.trilhas_catalogo for select to authenticated, anon using (true);

drop policy if exists trilhas_catalogo_admin_all on public.trilhas_catalogo;
create policy trilhas_catalogo_admin_all
  on public.trilhas_catalogo for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trilhas_catalogo_set_updated_at on public.trilhas_catalogo;
create trigger trilhas_catalogo_set_updated_at
  before update on public.trilhas_catalogo
  for each row execute function public.set_updated_at();

grant select on public.trilhas_catalogo to authenticated, anon;
grant insert, update, delete on public.trilhas_catalogo to authenticated;

create table if not exists public.aulas_catalogo (
  id text primary key,
  trilha_id text not null,
  "order" integer not null,
  title text not null,
  summary text not null,
  -- Array de BibleReference (jsonb) — mesmo formato de
  -- `study/schemas.ts#aulaSchema.bibleReferences`.
  bible_references jsonb not null,
  estimated_minutes integer not null default 5,
  quiz_id text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.aulas_catalogo is
  'Aulas ADICIONAIS de `trilhas_catalogo` OU de uma trilha estática existente (trilha_id aceita qualquer id, sem FK — trilhas estáticas não estão em tabela). Painel admin, T-015/ADR-056.';

alter table public.aulas_catalogo enable row level security;

drop policy if exists aulas_catalogo_select_all on public.aulas_catalogo;
create policy aulas_catalogo_select_all
  on public.aulas_catalogo for select to authenticated, anon using (true);

drop policy if exists aulas_catalogo_admin_all on public.aulas_catalogo;
create policy aulas_catalogo_admin_all
  on public.aulas_catalogo for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists aulas_catalogo_set_updated_at on public.aulas_catalogo;
create trigger aulas_catalogo_set_updated_at
  before update on public.aulas_catalogo
  for each row execute function public.set_updated_at();

grant select on public.aulas_catalogo to authenticated, anon;
grant insert, update, delete on public.aulas_catalogo to authenticated;

create table if not exists public.quizzes_catalogo (
  id text primary key,
  -- Presente quando o quiz pertence a uma aula (estática OU de
  -- aulas_catalogo); ausente para quizzes bíblicos por capítulo/livro
  -- (mesmo desenho de `study/quiz/schemas.ts#quizSchema`, aulaId opcional).
  aula_id text,
  title text not null,
  -- Array de QuizQuestion (jsonb) — mesmo formato de
  -- `study/quiz/schemas.ts#quizQuestionSchema` (união discriminada por `type`).
  questions jsonb not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.quizzes_catalogo is
  'Quizzes ADICIONAIS (de aula ou avulsos) criados via painel admin (T-015/ADR-056) — motor genérico de study/quiz/engine.ts consome tanto isto quanto o conteúdo estático.';

alter table public.quizzes_catalogo enable row level security;

drop policy if exists quizzes_catalogo_select_all on public.quizzes_catalogo;
create policy quizzes_catalogo_select_all
  on public.quizzes_catalogo for select to authenticated, anon using (true);

drop policy if exists quizzes_catalogo_admin_all on public.quizzes_catalogo;
create policy quizzes_catalogo_admin_all
  on public.quizzes_catalogo for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop trigger if exists quizzes_catalogo_set_updated_at on public.quizzes_catalogo;
create trigger quizzes_catalogo_set_updated_at
  before update on public.quizzes_catalogo
  for each row execute function public.set_updated_at();

grant select on public.quizzes_catalogo to authenticated, anon;
grant insert, update, delete on public.quizzes_catalogo to authenticated;
